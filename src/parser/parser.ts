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

// https://stackoverflow.com/a/17428705
export const transpose = <T>(array: T[][]) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));

export function buildMultipleTruthTable(matches: MatchResult[], argument: boolean): TruthTable<true> {
    const semantics = matches.map(m => ((s) => [s, s(m)])(grammar.createSemantics())) as [SymbolicLogicSemantics, ohm.Dict][];
    const consts = [...new Set(semantics.map((s) => getConstants(s[1])).flat())];
    const tables = semantics.map(([semantics, s]) => buildRestOfTruthTable(semantics, s, consts));
    const [ main, cols ] = tables.reduce<[number[], TruthTableColumn[]]>((acc, cur, index) => [
            [...acc[0], acc[1].length + cur.main],
            [...acc[1], ...cur.cols, ...(
                (index !== tables.length - 1 ? [
                    [((index === tables.length - 2 && argument) ? "//" : "/"), ...Array(tables[0].cols[0].length - 1).fill("")]
                // Not sure why this is necessary but it is
                ] : []) as TruthTableColumn[]
            )]
        ], [[], []]);
    
    /*return {
        main: /*[tables[0].main, tables[1].main + tables[0].cols.length + 1] tables.reduce((acc, cur) => [[...acc[0], ]], [[], 0]),
        cols: [...tables[0].cols, ["/", ...Array(tables[0].cols[0].length - 1).fill("")], ...tables[1].cols]
    };*/

    return { main, cols };
}

function getConstants(semanticsInst: ohm.Dict) {
    const node: Node = semanticsInst._node;
    // First find all the constants
    const consts: string[] = [];
    const iterate = (node: Node) => {
        if (node.ctorName === "Identifier") {
            const value = (node.children[0] as TerminalNode)._value;
            if(!consts.includes(value)) consts.push(value);
        }
        else if(node.ctorName !== "_terminal") {
            (node as NodeWithChildren).children.forEach(iterate);
        }
    };
    iterate(node);
    return consts;
}

function buildRestOfTruthTable(semantics: SymbolicLogicSemantics, semanticsInst: ohm.Dict, consts: string[]): TruthTable {
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
    const wrapper = (arg0: any) => arg0.eval();
    const dyadicActionFactory = (fn: (a: boolean, b: boolean) => boolean, symbol: string) => function(this: NonterminalNode, arg0: NonterminalNode, _: OTerminalNode, arg2: NonterminalNode) {
        const e0 = arg0.eval();
        const e2 = arg2.eval();
        const result = (transpose([e0.cols[e0.main], e2.cols[e2.main]]).slice(1) as boolean[][]).map(([a, b]) => fn(a, b));
        
        return {
            main: e0.cols.length,
            cols: [...e0.cols, [symbol, ...result], ...e2.cols]
        };
    }
    // Evaluate the thing
    semantics.addOperation<TruthTable>("eval", {
        Exp: wrapper,
        Dyadic: wrapper,
        Monadic: wrapper,
        Grouping(arg0, arg1, arg2) {
            const e = arg1.eval();
            e.cols[0][0] = arg0.sourceString + e.cols[0][0];
            e.cols[e.cols.length - 1][0] += arg2.sourceString;
            return e;
        },
        OperatorParam: wrapper,
        Conjunction: dyadicActionFactory((a, b) => a && b, "&"),
        Disjunction: dyadicActionFactory((a, b) => a || b, "v"),
        Conditional: dyadicActionFactory((a, b) => !(a && !b) /* or !a || b */, "⊃"),
        Biconditional: dyadicActionFactory((a, b) => a === b, "≡"),
        Negation(arg0, arg1) {
            // If more monadic operators are added I should split this out into a factory, but for now it's fine
            const e = arg1.eval();
            return {
                main: 0,
                cols: [["~", ...e.cols[e.main].slice(1).map((a: boolean) => !a)], ...e.cols]
            };
        },
        Identifier(arg0) {
            return {
                main: 0,
                cols: [constColumns[arg0.sourceString].slice() as TruthTableColumn]
            }
        }
    });

    return semanticsInst.eval();
}

function buildTruthTable(match: MatchResult) {
    const semantics = grammar.createSemantics();
    const semanticsInst = semantics(match);
    return buildRestOfTruthTable(semantics, semanticsInst, getConstants(semanticsInst));
}

export default function parse(input: string): ({
    success: true,
    truthTable: TruthTable,
    match: MatchResult
} | {
    success: false,
    match: {
        _rightmostFailurePosition: number,
        _rightmostFailures: unknown[],
        input: string,
        matcher: unknown,
        message: string,
        shortMessage: string,
        startExpr: unknown
    }
}) {
    const semantics = grammar.createSemantics();
    const match = grammar.match(input);
    if (match.succeeded()) {
        // Now let's build the truth table
        return {
            success: true,
            truthTable: buildTruthTable(match),
            match
        };
    } else {
        return {
            success: false,
            // Function type from observations of the actual returned object
            match: match as any
        }
    }
}