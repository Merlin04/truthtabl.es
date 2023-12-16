// AUTOGENERATED FILE
// This file was generated from SymbolicLogic.ohm by `ohm generateBundles`.

import {
  ActionDict,
  Grammar,
  IterationNode,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode
} from 'ohm-js';

export interface SymbolicLogicActionDict<T> extends ActionDict<T> {
  Exp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  bicond_op?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Bicond_expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Bicond?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  cond_op?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Cond_expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Cond?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  disj_op?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Disj_expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Disj?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  conj_op?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Conj_expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Conj?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  neg_op?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Neg_expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode) => T;
  Neg?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  gparen?: (this: NonterminalNode, arg0: TerminalNode) => T;
  gsquare?: (this: NonterminalNode, arg0: TerminalNode) => T;
  gcurly?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Grouping?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  ident?: (this: NonterminalNode, arg0: NonterminalNode) => T;
}

export interface SymbolicLogicSemantics extends Semantics {
  addOperation<T>(name: string, actionDict: SymbolicLogicActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: SymbolicLogicActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: SymbolicLogicActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: SymbolicLogicActionDict<T>): this;
}

export interface SymbolicLogicGrammar extends Grammar {
  createSemantics(): SymbolicLogicSemantics;
  extendSemantics(superSemantics: SymbolicLogicSemantics): SymbolicLogicSemantics;
}

declare const grammar: SymbolicLogicGrammar;
export default grammar;

