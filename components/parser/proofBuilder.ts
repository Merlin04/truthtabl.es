import ohm from "ohm-js";
import grammar from "./SymbolicLogic.ohm-bundle";

enum NodeType {
    Node,
    PlaceholderNode
};

type Node<CanAcceptPlaceholderNodes extends (true | false) = false> = {
    _t: NodeType.Node;
    token: string;
    children: (CanAcceptPlaceholderNodes extends true ? (Node<true> | PlaceholderNode) : Node<false>)[];
}

const semantics = (() => {
    const semantics = grammar.createSemantics();
    const wrapper = (arg0: any) => arg0.eval();
    const dyadic = (arg0: ohm.TerminalNode, arg1: ohm.NonterminalNode, arg2: ohm.TerminalNode) => ({
        _t: NodeType.Node,
        token: arg1.sourceString,
        children: [arg0, arg2].map(a => a.eval())
    } as Node);
    const monadic = (arg0: ohm.NonterminalNode, arg1: ohm.TerminalNode) => ({
        _t: NodeType.Node,
        token: arg0.sourceString,
        children: [arg1.eval()]
    } as Node);
    // TODO: normalize operator tokens
    semantics.addOperation<Node>("eval", {
        Exp: wrapper,
        Dyadic: wrapper,
        Monadic: wrapper,
        Grouping(_, arg1, _2) {
            return arg1.eval();
        },
        OperatorParam: wrapper,
        Conjunction: dyadic,
        Disjunction: dyadic,
        Conditional: dyadic,
        Biconditional: dyadic,
        Negation: monadic,
        Identifier(arg0) {
            return {
                _t: NodeType.Node,
                token: arg0.sourceString,
                children: []
            };
        }
    });

    return semantics;
})();

const argumentForms = ((argumentForms: {
    name: string;
    abbreviation: string;
    premises: string[];
    conclusion: string[];
}[]) => {
    function parse(input: string): Node {
        const match = grammar.match(input);
        if (!match.succeeded()) throw new Error(`Unable to parse argument form part ${input}`);
        return semantics(match).eval();
    }

    return argumentForms.map(a => ({
        ...a,
        premises: a.premises.map(parse),
        conclusion: a.conclusion.map(parse)
    }));
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
    * If fail, try a different argument
    * If succeed, generate conclusions from variables
 */

// Wrapper for mutating array method
function removeEl<T extends Array<any>>(arr: T, index: number) {
    const newArr = [...arr];
    arr.splice(index, 1);
    return arr;
}

// TODO remove - A sorted array of premises (order indicating the corresponding statement)

/**
 * Check if an array of statements matches the premises of an argument
 * @returns A result object with a variables object containing corresponding values from the statements, or false if the statements cannot match the premises in any order
 */
function matchPremises(premises: Node[], parsedStatements: Node[], vars: PMatchVars = {}): {
    //nodes: Node[],
    vars: PMatchVars
} | false {
    for (let i = 0; i < premises.length; i++) {
        const premise = premises[i];
        const pRes = patternMatchNode(premise, parsedStatements[0], vars);
        if (pRes) {
            const nextPremises = matchPremises(removeEl(premises, i), parsedStatements.slice(1), pRes.vars);
            if (nextPremises) {
                return {
                    //nodes: [premise, ...nextPremises.nodes],
                    vars: nextPremises.vars
                };
            }
        }
    }
    return false;
}

//function filterMap<T extends Array<any>(arr: T, fn: ())

// Addition returns a variable that's not in the premises; we need to handle this by creating a placeholder that can be handled in the frontend
type PlaceholderNode = {
    _t: NodeType.PlaceholderNode
};

function replaceVars(source: Node, vars: PMatchVars): Node<true> | PlaceholderNode {
    if(source.children.length === 0) {
        /*if(!vars[source.token]) {
            throw new Error(`No value found for variable ${source.token} while replacing variables in conclusion of argument form`);
        }*/
        return vars[source.token] ?? {
            _t: NodeType.PlaceholderNode
        };
    }
    return {
        ...source,
        children: source.children.map(c => replaceVars(c, vars))
    };
}

// .filter(a => a.premises.length === statements.length)
const PLACEHOLDER_TOKEN = "%";
export function stringifyNode(node: Node<any> | PlaceholderNode): string {
    if(node._t === NodeType.PlaceholderNode) {
        return PLACEHOLDER_TOKEN;
    }
    if(node.children.length === 0) {
        return node.token;
    }
    const stringifyChild = (index: number) => {
        const n = node.children[index];
        const s = stringifyNode(n);
        return n._t === NodeType.Node && (n as Node<any>).children.length > 1 ? `(${n})` : n;
    }
    if(node.children.length === 1) {
        /*if(node.children[0]._t === NodeType.Node && node.children[0].children.length > 1) {
            return `${node.token}(${stringifyNode(node.children[0])})`;
        }*/
        return node.token + stringifyChild(0);
    }
    if(node.children.length === 2) {
        return `${stringifyChild(0)} ${node.token} ${stringifyChild(1)}`;
    }
    throw new Error("During stringification of a node, a node has more than 2 children");
}

function getPossibilies(statements: string[]) {
    const parsedStatements = statements.map(parse);
    return argumentForms.flatMap(arg => {
        if(arg.premises.length !== statements.length) return [];

        const res = matchPremises(arg.premises, parsedStatements);
        if(res) {
            // Apply the variables to the conclusion
            return [{
                arg,
                results: arg.conclusion.map(c => replaceVars(c, res.vars))
            }];
        }
        else {
            return [];
        }
    });
    /*return argumentForms.filter(a => a.premises.length === statements.length).filter(a => {
        // Figure out which statements correspond to which premises
        let s = [...statements];
        // Return possible conclusions
    });*/
}

type PMatchVars = {
    [key: string]: Node
};

const commutativeOperators = ["v", "&"];

/*function areNodesEqual(a: Node, b: Node): boolean {
    const childrenEqual: {(): boolean} = () => a.children.every((v, i) => areNodesEqual(v, b.children[i]));

    return a.token === b.token && a.children.length === b.children.length && (commutativeOperators.includes(a.token) ? (
        childrenEqual() || (areNodesEqual(a.children[0], b.children[1]) && areNodesEqual(a.children[1], b.children[0]))
    ) : childrenEqual());
}*/

function patternMatchNode(pattern: Node, input: Node, vars: PMatchVars = {}): {
    vars: PMatchVars
} | false {
    const areNodesEqual = (a: Node, b: Node, compareFn: { (a: Node, b: Node): boolean }) => {
        const childrenEqual: { (): boolean } = () => a.children.every((v, i) => compareFn(v, b.children[i]));

        return a.token === b.token && a.children.length === b.children.length && (commutativeOperators.includes(a.token) ? (
            childrenEqual() || (compareFn(a.children[0], b.children[1]) && compareFn(a.children[1], b.children[0]))
        ) : childrenEqual());
    };

    if (pattern.children.length === 0) {
        // It's an identifier
        if (vars[pattern.token] !== undefined) {
            // Try to match the value
            //return patternMatchNode(vars[pattern.token], input, vars);
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

/*const expect = <T>(desc: string, input: T, expected: T) => {
    if(input === expected) {
        console.log(`Success: ${desc}`);
    }
    else {
        console.error(`Fail: ${desc}
Expected: ${JSON.stringify(expected)}
Got: ${JSON.stringify(input)}`);
    }
};

const s = (v: ReturnType<typeof patternMatchNode>) => !!v;
const pmTest = (a: string, b: string) => s(patternMatchNode(parse(a), parse(b)));
const pmExpect = (a: string, b: string, expected: boolean) => expect(`${a} ${expected ? "matches" : "doesn't match"} ${b}`, pmTest(a, b), expected);


pmExpect("A v B", "A v B", true);
pmExpect("A v B", "A & B", false);
pmExpect("~A", "A v B", false);
pmExpect("A v A", "~(A v B) v ~(A v B)", true);
pmExpect("A v A", "~(A v B) v ~(A v C)", false);
*/

console.log(getPossibilies([
    "A > B",
    "~B"
]))

export { };