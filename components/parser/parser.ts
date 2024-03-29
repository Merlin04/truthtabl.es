import grammar, { SymbolicLogicSemantics } from "./SymbolicLogic.ohm-bundle";
import ohm, { MatchResult, NonterminalNode, TerminalNode as OTerminalNode } from "ohm-js";

type NodeBase = {
    grammar: unknown,
    matchLength: number
};
type TerminalNode = NodeBase & {
    ctorName: "_terminal",
    _value: string
};
type NodeWithChildren = NodeBase & {
    childOffsets: number[],
    children: Node[],
    ctorName: string
};

type Node = TerminalNode | NodeWithChildren;

type TruthTableColumn = [string, ...boolean[]];
export type TruthTable<MultipleMain extends boolean = false> = {
    main: MultipleMain extends true ? number[] : number,
    cols: TruthTableColumn[]
}

export type TruthTableData<MultipleMain extends boolean = false> = {
    simple: TruthTable<MultipleMain>,
    detailed: TruthTable<MultipleMain>,
    consts?: string[],
    source?: string
}

// https://stackoverflow.com/a/17428705
export const transpose = <T>(array: T[][]) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));

export function buildMultipleTruthTable(matches: MatchResult[], argument: boolean): TruthTableData<true> {
    const semantics = matches.map(m => ((s) => [s, s(m)])(grammar.createSemantics())) as [SymbolicLogicSemantics, ohm.Dict][];
    const consts = [...new Set(semantics.map((s) => getConstants(s[1])).flat())];
    const tables = semantics.map(([s, sInst]) => buildTruthTable(s, sInst, consts)); // unfortunately we have to call this again, since we're giving it a different consts parameter

    const joinTables = (tables: TruthTable[]) => {
        const [h, ...t] = tables;
        return t.reduce<TruthTable<true>>((acc, cur, index) => ({
            main: [...acc.main, acc.cols.length + cur.main + 1],
            cols: [...acc.cols, ...(
                (index !== tables.length - 1 ? [
                    [((index === tables.length - 2 && argument) ? "//" : "/"), ...Array(tables[0].cols[0].length - 1).fill("")]
                    // Not sure why this is necessary but it is
                ] : []) as TruthTableColumn[]
            ), ...cur.cols]
        }), { main: [h.main], cols: h.cols });
    };

    return {
        simple: joinTables(tables.map(t => t.simple)),
        detailed: joinTables(tables.map(t => t.detailed))
    };
}

function getConstants(semanticsInst: ohm.Dict) {
    const node: Node = semanticsInst._node;
    // First find all the constants
    const consts: string[] = [];
    const iterate = (node: Node) => {
        if (node.ctorName === "ident") {
            const extract = (ns : NonterminalNode[]) : string => ns.map((n : NonterminalNode) => n.children ? extract(n.children) : n._value).join("");
            const value = extract((node as unknown as NonterminalNode).children);
            if(!consts.includes(value)) consts.push(value);
        }
        else if(node.ctorName !== "_terminal") {
            (node as NodeWithChildren).children.forEach(iterate);
        }
    };
    iterate(node);
    return consts;
}

function buildTruthTable(semantics: SymbolicLogicSemantics, semanticsInst: ohm.Dict, consts: string[]): TruthTableData {
    // Generate constant truth table columns
    const constColumns: {
        [key: string]: TruthTableColumn
    } = {};
    const columnHeight = 2 ** consts.length;
    consts.forEach((constant, index) => {
        const numberOfTrueFalse = columnHeight * (1 / 2 ** (index + 1));
        const seq = [];
        for (let i = 0; i < numberOfTrueFalse; i++) {
            seq.push(true);
        }
        for (let i = 0; i < numberOfTrueFalse; i++) {
            seq.push(false);
        }

        const seqLen = columnHeight / (numberOfTrueFalse * 2);
        constColumns[constant] = [constant];
        for (let i = 0; i < seqLen; i++) {
            constColumns[constant] = (Array.prototype.concat.call(constColumns[constant], seq) as TruthTableColumn);
        }
    });
    const dyadicActionFactory = (fn: (a: boolean, b: boolean) => boolean) => function(this: NonterminalNode, arg0: NonterminalNode, op: OTerminalNode, arg2: NonterminalNode) {
        const e0 = arg0.eval();
        const e2 = arg2.eval();
        const result = (transpose([e0.cols[e0.main], e2.cols[e2.main]]).slice(1) as boolean[][]).map(([a, b]) => fn(a, b));
        
        return {
            main: e0.cols.length,
            cols: [...e0.cols, [op.sourceString, ...result], ...e2.cols]
        };
    }
    // Evaluate the thing
    let source: string | undefined; // hack
    semantics.addOperation<TruthTable>("eval", {
        Exp(e) {
            if(!source) source = e.sourceString;
            return e.eval();
        },
        Bicond_expr: dyadicActionFactory((a, b) => a === b),
        Cond_expr: dyadicActionFactory((a, b) => !(a && !b) /* or !a || b */),
        Disj_expr: dyadicActionFactory((a, b) => a || b),
        Conj_expr: dyadicActionFactory((a, b) => a && b),
        Neg_expr(op, arg) {
            // If more monadic operators are added I should split this out into a factory, but for now it's fine
            const e = arg.eval();
            return {
                main: 0,
                cols: [[op.sourceString, ...e.cols[e.main].slice(1).map((a: boolean) => !a)], ...e.cols]
            };
        },
        Grouping(arg0, arg1, arg2) {
            const e = arg1.eval();
            e.cols[0][0] = arg0.sourceString + e.cols[0][0];
            e.cols[e.cols.length - 1][0] += arg2.sourceString;
            return e;
        },
        ident(arg0) {
            return {
                main: 0,
                cols: [constColumns[arg0.sourceString].slice() as TruthTableColumn]
            }
        }
    });

    const detailed: TruthTable = semanticsInst.eval();
    // build
    const constColumnValues = Object.values(constColumns);
    const [_, ...rt] = detailed.cols[detailed.main]
    const simple = {
        main: constColumnValues.length,
        cols: [...constColumnValues, [source!, ...rt] as TruthTableColumn]
    };

    return { simple, detailed, consts };
}

type ParseResultSuccess = {
    success: true,
    match: MatchResult,
    table: TruthTableData
}
export type ParseResult = ParseResultSuccess | {
    success: false,
    // type from observations of the actual returned object
    match: {
        _rightmostFailurePosition: number,
        _rightmostFailures: unknown[],
        input: string,
        matcher: unknown,
        message: string,
        shortMessage: string,
        startExpr: unknown
    }
}
export function parse(input: string): ParseResult {
    const match = grammar.match(input);
    const success = match.succeeded();
    if (!success) return { success, match } as unknown as ParseResult;
    const semantics = grammar.createSemantics();
    const semanticsInst = semantics(match);
    const consts = getConstants(semanticsInst);
    return {
        success,
        match,
        table: buildTruthTable(semantics, semanticsInst, consts)
    };
}