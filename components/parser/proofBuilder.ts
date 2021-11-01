import ohm from "ohm-js";
import grammar from "./SymbolicLogic.ohm-bundle";

enum NodeType {
    Node,
    PlaceholderNode
};

export type Node<CanAcceptPlaceholderNodes extends (true | false) = false> = {
    _t: NodeType.Node;
    token: string;
    children: (CanAcceptPlaceholderNodes extends true ? (Node<true> | PlaceholderNode) : Node<false>)[];
}

export function createSemantics<T>({ dyadic, monadic, identifier, grouping, signature }: {
    dyadic: (this: ohm.NonterminalNode, arg0: ohm.TerminalNode, arg1: ohm.NonterminalNode, arg2: ohm.TerminalNode) => T,
    monadic: (this: ohm.NonterminalNode, arg0: ohm.NonterminalNode, arg1: ohm.TerminalNode) => T,
    identifier: (this: ohm.NonterminalNode, arg0: ohm.TerminalNode) => T,
    grouping?: (this: ohm.NonterminalNode, arg0: ohm.NonterminalNode, arg1: ohm.TerminalNode, arg2: ohm.NonterminalNode) => T,
    signature?: string
}) {
    const semantics = grammar.createSemantics();
    const wrapper = function(this: ohm.NonterminalNode, arg0: any) { return arg0.eval(...Object.values(this.args)); };
    semantics.addOperation<T>("eval" + (signature ?? ""), {
        Exp: wrapper,
        Dyadic: wrapper,
        Monadic: wrapper,
        Grouping: grouping ?? (function(_, arg1, _2) { return arg1.eval(...Object.values(this.args)); }),
        OperatorParam: wrapper,
        Conjunction: dyadic,
        Disjunction: dyadic,
        Conditional: dyadic,
        Biconditional: dyadic,
        Negation: monadic,
        Identifier: identifier
    });

    return semantics;
}

const semantics = createSemantics<Node>({
    // TODO: normalize operator tokens
    dyadic: (arg0, arg1, arg2) => ({
        _t: NodeType.Node,
        token: arg1.sourceString,
        children: [arg0, arg2].map(a => a.eval())
    }),
    monadic: (arg0, arg1) => ({
        _t: NodeType.Node,
        token: arg0.sourceString,
        children: [arg1.eval()]
    }),
    identifier: (arg0) => ({
        _t: NodeType.Node,
        token: arg0.sourceString,
        children: []
    })
});

// https://gist.github.com/newmanbrad/bf83d49bfaa0bfb4094fe9f2b0548bef
let isObject = (val: any) => val && typeof val === 'object';
function deepFreezeObject<T>(obj: T): T {
  if(isObject(obj) && !Object.isFrozen(obj)){ 
    // Recusively call until all child objects are frozen
    //@ts-expect-error
    Object.keys(obj).forEach(name => deepFreezeObject(obj[name]));
    Object.freeze(obj);
  }
  return obj;
}

function parseArgFormPart(input: string): Node {
    const match = grammar.match(input);
    if (!match.succeeded()) throw new Error(`Unable to parse argument form part ${input}`);
    return semantics(match).eval();
}

const replacementRules = ((replacementRules: {
    name: string,
    abbreviation: string,
    rules: [string, string][]
}[]) => deepFreezeObject(replacementRules.map(a => ({
    ...a,
    rules: a.rules.map(r => r.map(parseArgFormPart))
}))))([
    {
        name: "Commutation",
        abbreviation: "Com",
        rules: [
            ["P & Q", "Q & P"],
            ["P v Q", "Q v P"]
        ]
    },
    {
        name: "Associativity",
        abbreviation: "Assoc",
        rules: [
            ["P & (Q & R)", "(P & Q) & R"],
            ["P v (Q v R)", "(P v Q) v R"]
        ]
    },
    {
        name: "Double Negation",
        abbreviation: "DN",
        rules: [["P", "~~P"]]
    },
    {
        name: "De Morgan's",
        abbreviation: "DM",
        rules: [
            ["~(P & Q)", "~P v ~Q"],
            ["~(P v Q)", "~P & ~Q"]
        ]
    },
    {
        name: "Distribution",
        abbreviation: "Dist",
        rules: [
            ["P v (Q & R)", "(P v Q) & (P v R)"],
            ["P & (Q v R)", "(P & Q) v (P & R)"]
        ]
    },
    {
        name: "Transposition",
        abbreviation: "Trans",
        rules: [
            ["P > Q", "~Q > ~P"],
            ["~P > ~Q", "Q > P"]
        ]
    },
    {
        name: "Implication",
        abbreviation: "Imp",
        rules: [["P > Q", "~P v Q"]]
    },
    {
        name: "Exportation",
        abbreviation: "Exp",
        rules: [["(P & Q) > R", "P > (Q > R)"]]
    },
    {
        name: "Tautology",
        abbreviation: "Taut",
        rules: [
            ["P", "P & P"],
            ["P", "P v P"]
        ]
    },
    {
        name: "Equivalence",
        abbreviation: "Equiv",
        rules: [
            ["P = Q", "(P > Q) & (Q > P)"],
            ["P = Q", "(P & Q) v (~P & ~Q)"]
        ]
    }
]);

const argumentForms = ((argumentForms: {
    name: string;
    abbreviation: string;
    premises: string[];
    conclusion: string[];
}[]) => {
    // Deep-freezing helps prevent against mutability bugs
    return deepFreezeObject(argumentForms.map(a => ({
        ...a,
        premises: a.premises.map(parseArgFormPart),
        conclusion: a.conclusion.map(parseArgFormPart)
    })));
})([
    {
        name: "Modus Ponens",
        abbreviation: "MP",
        premises: [
            "P > Q",
            "P"
        ],
        conclusion: ["Q"]
    },
    {
        name: "Modus Tollens",
        abbreviation: "MT",
        premises: [
            "P > Q",
            "~Q"
        ],
        conclusion: ["~P"]
    },
    {
        name: "Disjunctive Syllogism",
        abbreviation: "DS",
        premises: [
            "P v Q",
            "~P"
        ],
        conclusion: ["Q"]
    },
    {
        name: "Disjunctive Syllogism",
        abbreviation: "DS",
        premises: [
            "P v Q",
            "~Q"
        ],
        conclusion: ["P"]
    },
    {
        name: "Hypothetical Syllogism",
        abbreviation: "HS",
        premises: [
            "P > Q",
            "Q > R"
        ],
        conclusion: ["P > R"]
    },
    {
        name: "Simplification",
        abbreviation: "Simp",
        premises: [
            "P & Q"
        ],
        conclusion: ["P", "Q"]
    },
    {
        name: "Conjunction",
        abbreviation: "Conj",
        premises: [
            "P",
            "Q"
        ],
        conclusion: ["P & Q"]
    },
    {
        name: "Addition",
        abbreviation: "Add",
        premises: [
            "P"
        ],
        conclusion: ["P v Q"]
    },
    {
        name: "Constructive Dilemma",
        abbreviation: "CD",
        premises: [
            "P > Q",
            "R > S",
            "P v R"
        ],
        conclusion: ["Q v S"]
    }
]);

/*
 * Algorithm
 * Try each argument form with the correct arity
    * Choose a premise and try to match it
        * If succeed, continue to the next premise
        * If not, try a different premise
    * If fail, try a different argument form
    * If succeed, generate conclusions from variables
 */

// Wrapper for mutating array method
export function removeEl<T extends Array<any>>(arr: T, index: number) {
    const newArr = [...arr];
    newArr.splice(index, 1);
    return newArr;
}

/**
 * Check if an array of statements matches the premises of an argument
 * @returns A result object with a variables object containing corresponding values from the statements, or false if the statements cannot match the premises in any order
 */
function matchPremises(premises: Node[], parsedStatements: Node[], vars: PMatchVars = {}): {
    vars: PMatchVars
} | false {
    for (let i = 0; i < premises.length; i++) {
        const premise = premises[i];
        const pRes = patternMatchNode(premise, parsedStatements[0], vars);
        if (pRes) {
            if(premises.length === 1) {
                // There aren't any more premises to check
                return {
                    vars: pRes.vars
                };
            }
            const nextPremises = matchPremises(removeEl(premises, i), parsedStatements.slice(1), pRes.vars);
            if (nextPremises) {
                return {
                    vars: nextPremises.vars
                };
            }
        }
    }
    return false;
}

// Addition returns a variable that's not in the premises; we need to handle this by creating a placeholder that can be handled in the frontend
type PlaceholderNode = {
    _t: NodeType.PlaceholderNode
};

function replaceVars(source: Node, vars: PMatchVars): Node<true> | PlaceholderNode {
    if(source.children.length === 0) {
        return vars[source.token] ?? {
            _t: NodeType.PlaceholderNode
        };
    }
    return {
        ...source,
        children: source.children.map(c => replaceVars(c, vars))
    };
}

export const PLACEHOLDER_TOKEN = "%";
export function stringifyNode(node: Node<any> | PlaceholderNode): string {
    if(node._t === NodeType.PlaceholderNode) {
        return PLACEHOLDER_TOKEN;
    }
    if(node.children.length === 0) {
        return node.token;
    }
    const stringifyChild = (index: number) => {
        const n = node.children[index];
        const stringified = stringifyNode(n);
        return n._t === NodeType.Node && (n as Node<any>).children.length > 1 ? `(${stringified})` : stringified;
    }
    if(node.children.length === 1) {
        return node.token + stringifyChild(0);
    }
    if(node.children.length === 2) {
        return `${stringifyChild(0)} ${node.token} ${stringifyChild(1)}`;
    }
    throw new Error("During stringification of a node, a node has more than 2 children");
}

const uniq = <T>(items: T[]) => [...new Set(items)];

export function getPossibilities(statements: string[]) {
    const parsedStatements = statements.map(parse);
    return argumentForms.flatMap(arg => {
        if(arg.premises.length !== statements.length) return [];

        const res = matchPremises(arg.premises, parsedStatements);
        if(res) {
            // Apply the variables to the conclusion
            return [{
                arg,
                results: uniq(arg.conclusion.map(c => stringifyNode(replaceVars(c, res.vars))))
            }];
        }
        else {
            return [];
        }
    });
}

export function getReplacementPossibilities(statement: string) {
    const parsed = parse(statement);
    return replacementRules.flatMap(arg => ({
        arg,
        results: uniq(arg.rules.flatMap(rule => [rule, [rule[1], rule[0]]]).flatMap(rulePart => {
            const res = patternMatchNode(rulePart[0], parsed);
            if(res) return stringifyNode(replaceVars(rulePart[1], res.vars));
            return [];
        }))
    }));
}

type PMatchVars = {
    [key: string]: Node
};

function areNodesEqual(a: Node, b: Node, compareFn: { (a: Node, b: Node): boolean }) {
    const childrenEqual: { (): boolean } = () => a.children.every((v, i) => compareFn(v, b.children[i]));

    return a.token === b.token && a.children.length === b.children.length && childrenEqual();
};

function patternMatchNode(pattern: Node, input: Node, vars: PMatchVars = {}): {
    vars: PMatchVars
} | false {
    if (pattern.children.length === 0) {
        // It's an identifier
        if (vars[pattern.token] !== undefined) {
            // Try to match the value
            const e = (a: Node, b: Node) => areNodesEqual(a, b, e);
            return areNodesEqual(vars[pattern.token], input, e) ? { vars } : false;
        }
        else {
            return {
                vars: {
                    ...vars,
                    [pattern.token]: input
                }
            };
        }
    }
    // Compare children
    const newVars = { ...vars };
    return areNodesEqual(pattern, input, (a, b) => {
        const res = patternMatchNode(a, b, newVars);
        if (!res) return false;
        Object.entries(res.vars).forEach(([k, v]) => {
            newVars[k] = v;
        });
        return true;
    }) ? {
        vars: newVars
    } : false;
}

const parse = (input: string) => semantics(grammar.match(input)).eval() as Node;

export const parseAsNode = parse;