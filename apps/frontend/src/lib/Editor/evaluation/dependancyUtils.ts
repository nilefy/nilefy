import type { Node, Options } from 'acorn';
import { parse } from 'acorn';

import { ancestor } from 'acorn-walk';
import { has, isArray, isFinite, isString, toPath } from 'lodash';
import {
  bindingRegexGlobal,
  functionActionWrapper,
  functionExpressionWrapper,
  sanitizeScript,
} from './utils';
export type DependencyRelation = {
  // from is the dependent
  dependent: { entityId: string; path: string };
  // to is the dependency
  dependency: { entityId: string; path: string };
};
export type AnalysisContext = Record<string, Set<string>>;

export const analyzeDependancies = ({
  code,
  toProperty = 'NONE',
  entityId,
  keys,
  isAction = false,
  isPossiblyJSBinding = true,
}: {
  code: unknown;
  toProperty?: string;
  entityId: string;
  keys: AnalysisContext;
  isAction?: boolean;
  isPossiblyJSBinding?: boolean;
}) => {
  if (typeof code !== 'string')
    return { toProperty, dependencies: [], isCode: false };
  const entityNames = new Set(Object.keys(keys));
  const dependencies: Array<DependencyRelation> = [];
  let isCode = false;
  if (isPossiblyJSBinding) {
    const matches = code.matchAll(bindingRegexGlobal);
    const errors: unknown[] = [];
    for (const match of matches) {
      isCode = true;
      const expression = match[1];
      const wrappedExpression = isAction
        ? functionActionWrapper(expression)
        : functionExpressionWrapper(expression);
      _analyzeDependencies({
        code: wrappedExpression,
        entityNames,
        keys,
        dependencies,
        errors,
        entityId,
        toProperty,
      });
    }
  } else {
    isCode = true;
    const wrappedCode = functionActionWrapper(code);
    _analyzeDependencies({
      code: wrappedCode,
      entityNames,
      keys,
      dependencies,
      errors: [],
      entityId,
      toProperty,
    });
  }
  // todo return errors and do something with them
  return { toProperty, dependencies, isCode };
};
const _analyzeDependencies = ({
  code,
  entityNames,
  keys,
  dependencies,
  errors,
  entityId,
  toProperty,
}: {
  code: string;
  entityNames: Set<string>;
  keys: AnalysisContext;
  dependencies: DependencyRelation[];
  errors: unknown[];
  entityId: string;
  toProperty: string;
}) => {
  try {
    const { references: dependanciesInExpression } =
      extractIdentifierInfoFromCode(code);
    main_loop: for (const dependancy of dependanciesInExpression) {
      const dependancyParts = dependancy.split('.');
      const dependancyName = dependancyParts[0];
      const fullPath = dependancyParts.slice(1).join('.');
      if (!entityNames.has(dependancyName)) continue;
      const pathPermutation = calcPathPermutations(fullPath);
      for (const path of pathPermutation) {
        if (keys[dependancyName].has(path)) {
          // TODO remove dependent part of the object, since it's not of any use
          dependencies.push({
            dependent: {
              entityId,
              path: toProperty,
            },
            dependency: {
              entityId: dependancyName,
              path,
            },
          });
          continue main_loop;
        }
      }
    }
  } catch (e: unknown) {
    errors.push(e);
  }
};
/**
 * Converts `array` to a property path string.
 *
 * @private
 * @param {Array} array The array to convert.
 * @returns {string} Returns the property path string.
 */
function pathToString(array: string[]) {
  return array.reduce(function (string, item) {
    const prefix = string === '' ? '' : '.';
    return string + (isNaN(Number(item)) ? prefix + item : '[' + item + ']');
  }, '');
}
/**
 * Converts array `value` to a property path string.
 *
 * @static
 * @memberOf _
 * @since 4.6.1
 * @category Util
 * @param {*} value The value to convert.
 * @returns {string} Returns the new property path string.
 * @example
 *
 * _.fromPath(['a', 'b', 'c']);
 * // => 'a.b.c'
 *
 * _.fromPath(['a', '0', 'b', 'c']);
 * // => 'a[0].b.c'
 *
 */
function fromPath(value: string[]) {
  if (isArray(value)) {
    return pathToString(value);
  }
  return '';
}
const calcPathPermutations = (path: string) => {
  const pathSplit = toPath(path);
  const pathPermutations = [];
  //use fromPath to calc possible paths
  for (let i = 0; i < pathSplit.length; i++) {
    pathPermutations.push(fromPath(pathSplit.slice(0, i + 1)));
  }
  return pathPermutations;
};

export const ECMA_VERSION = 11;

export const getStringValue = (
  inputValue: string | number | boolean | RegExp,
) => {
  if (typeof inputValue === 'object' || typeof inputValue === 'boolean') {
    inputValue = JSON.stringify(inputValue);
  } else if (typeof inputValue === 'number' || typeof inputValue === 'string') {
    inputValue += '';
  }
  return inputValue;
};

// Each node has an attached type property which further defines
// what all properties can the node have.
// We will just define the ones we are working with
enum NodeTypes {
  Identifier = 'Identifier',
  AssignmentPattern = 'AssignmentPattern',
  Literal = 'Literal',
  Property = 'Property',
  // Declaration - https://github.com/estree/estree/blob/master/es5.md#declarations
  FunctionDeclaration = 'FunctionDeclaration',
  ExportDefaultDeclaration = 'ExportDefaultDeclaration',
  VariableDeclarator = 'VariableDeclarator',
  // Expression - https://github.com/estree/estree/blob/master/es5.md#expressions
  MemberExpression = 'MemberExpression',
  FunctionExpression = 'FunctionExpression',
  ArrowFunctionExpression = 'ArrowFunctionExpression',
  AssignmentExpression = 'AssignmentExpression',
  ObjectExpression = 'ObjectExpression',
  ArrayExpression = 'ArrayExpression',
  ThisExpression = 'ThisExpression',
  CallExpression = 'CallExpression',
  BinaryExpression = 'BinaryExpression',
  ExpressionStatement = 'ExpressionStatement',
  BlockStatement = 'BlockStatement',
  ConditionalExpression = 'ConditionalExpression',
  AwaitExpression = 'AwaitExpression',
}
/*
 * Valuable links:
 *
 * * ESTree spec: Javascript AST is called ESTree.
 * Each es version has its md file in the repo to find features
 * implemented and their node type
 * https://github.com/estree/estree
 *
 * * Acorn: The parser we use to get the AST
 * https://github.com/acornjs/acorn
 *
 * * Acorn walk: The walker we use to traverse the AST
 * https://github.com/acornjs/acorn/tree/master/acorn-walk
 *
 * * AST Explorer: Helpful web tool to see ASTs and its parts
 * https://astexplorer.net/
 *
 */

type Pattern = IdentifierNode | AssignmentPatternNode;
type Expression = Node;
type ArgumentTypes =
  | LiteralNode
  | ArrowFunctionExpressionNode
  | ObjectExpression
  | MemberExpressionNode
  | CallExpressionNode
  | BinaryExpressionNode
  | BlockStatementNode
  | IdentifierNode;
// doc: https://github.com/estree/estree/blob/master/es5.md#memberexpression
interface MemberExpressionNode extends Node {
  type: NodeTypes.MemberExpression;
  object: MemberExpressionNode | IdentifierNode | CallExpressionNode;
  property: IdentifierNode | LiteralNode;
  computed: boolean;
  // doc: https://github.com/estree/estree/blob/master/es2020.md#chainexpression
  optional?: boolean;
}

interface BinaryExpressionNode extends Node {
  type: NodeTypes.BinaryExpression;
  left: BinaryExpressionNode | IdentifierNode;
  right: BinaryExpressionNode | IdentifierNode;
}

// doc: https://github.com/estree/estree/blob/master/es5.md#identifier
interface IdentifierNode extends Node {
  type: NodeTypes.Identifier;
  name: string;
}

//Using this to handle the Variable property refactor
interface RefactorIdentifierNode extends Node {
  type: NodeTypes.Identifier;
  name: string;
  property?: IdentifierNode;
}

// doc: https://github.com/estree/estree/blob/master/es5.md#variabledeclarator
interface VariableDeclaratorNode extends Node {
  type: NodeTypes.VariableDeclarator;
  id: IdentifierNode;
  init: Expression | null;
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functions
interface Function extends Node {
  id: IdentifierNode | null;
  params: Pattern[];
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functiondeclaration
// eslint-disable-next-line
interface FunctionDeclarationNode extends Node, Function {
  type: NodeTypes.FunctionDeclaration;
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functionexpression
// eslint-disable-next-line
interface FunctionExpressionNode extends Expression, Function {
  type: NodeTypes.FunctionExpression;
  async: boolean;
}
// eslint-disable-next-line
interface ArrowFunctionExpressionNode extends Expression, Function {
  type: NodeTypes.ArrowFunctionExpression;
  async: boolean;
}

interface ObjectExpression extends Expression {
  type: NodeTypes.ObjectExpression;
  properties: Array<PropertyNode>;
}

// doc: https://github.com/estree/estree/blob/master/es2015.md#assignmentpattern
interface AssignmentPatternNode extends Node {
  type: NodeTypes.AssignmentPattern;
  left: Pattern;
}

// doc: https://github.com/estree/estree/blob/master/es5.md#literal
interface LiteralNode extends Node {
  type: NodeTypes.Literal;
  value: string | boolean | null | number | RegExp;
  raw: string;
}

interface CallExpressionNode extends Node {
  type: NodeTypes.CallExpression;
  callee: CallExpressionNode | IdentifierNode | MemberExpressionNode;
  arguments: ArgumentTypes[];
}

interface BlockStatementNode extends Node {
  type: 'BlockStatement';
  body: [Node];
}

interface NodeList {
  references: Set<string>;
  functionalParams: Set<string>;
  variableDeclarations: Set<string>;
  identifierList: Array<IdentifierNode>;
}

// https://github.com/estree/estree/blob/master/es5.md#property
interface PropertyNode extends Node {
  type: NodeTypes.Property;
  key: LiteralNode | IdentifierNode;
  value: Node;
  kind: 'init' | 'get' | 'set';
}

type AstOptions = Omit<Options, 'ecmaVersion'>;

/* We need these functions to typescript casts the nodes with the correct types */
const isIdentifierNode = (node: Node): node is IdentifierNode => {
  return node.type === NodeTypes.Identifier;
};

const isMemberExpressionNode = (node: Node): node is MemberExpressionNode => {
  return node.type === NodeTypes.MemberExpression;
};

const isVariableDeclarator = (node: Node): node is VariableDeclaratorNode => {
  return node.type === NodeTypes.VariableDeclarator;
};

const isFunctionDeclaration = (node: Node): node is FunctionDeclarationNode => {
  return node.type === NodeTypes.FunctionDeclaration;
};

const isFunctionExpression = (node: Node): node is FunctionExpressionNode => {
  return node.type === NodeTypes.FunctionExpression;
};
const isArrowFunctionExpression = (
  node: Node,
): node is ArrowFunctionExpressionNode => {
  return node.type === NodeTypes.ArrowFunctionExpression;
};

const isAssignmentPatternNode = (node: Node): node is AssignmentPatternNode => {
  return node.type === NodeTypes.AssignmentPattern;
};

const isLiteralNode = (node: Node): node is LiteralNode => {
  return node.type === NodeTypes.Literal;
};

const isArrayAccessorNode = (node: Node): node is MemberExpressionNode => {
  return (
    isMemberExpressionNode(node) &&
    node.computed &&
    isLiteralNode(node.property) &&
    isFinite(node.property.value)
  );
};

const wrapCode = (code: string) => {
  return `
    (function() {
      return ${code}
    })
  `;
};

const getFunctionalParamNamesFromNode = (
  node:
    | FunctionDeclarationNode
    | FunctionExpressionNode
    | ArrowFunctionExpressionNode,
) => {
  return Array.from(getFunctionalParamsFromNode(node)).map(
    (functionalParam) => functionalParam.paramName,
  );
};

// Memoize the ast generation code to improve performance.
// Since this will be used by both the server and the client, we want to prevent regeneration of ast
// for the the same code snippet
const getAST = (code: string, options?: AstOptions) =>
  parse(code, { ...options, ecmaVersion: ECMA_VERSION });

/**
 * An AST based extractor that fetches all possible references in a given
 * piece of code. We use this to get any references to the global entities in Appsmith
 * and create dependencies on them. If the reference was updated, the given piece of code
 * should run again.
 * @param code: The piece of script where references need to be extracted from
 */

interface IdentifierInfo {
  references: string[];
  functionalParams: string[];
  variables: string[];
}
export const extractIdentifierInfoFromCode = (
  code: string,
  invalidIdentifiers?: Record<string, unknown>,
): IdentifierInfo => {
  let ast: Node = { end: 0, start: 0, type: '' };
  try {
    const sanitizedScript = sanitizeScript(code);
    /* wrapCode - Wrapping code in a function, since all code/script get wrapped with a function during evaluation.
       Some syntax won't be valid unless they're at the RHS of a statement.
       Since we're assigning all code/script to RHS during evaluation, we do the same here.
       So that during ast parse, those errors are neglected.
    */
    /* e.g. IIFE without braces
      function() { return 123; }() -> is invalid
      let result = function() { return 123; }() -> is valid
    */
    const wrappedCode = wrapCode(sanitizedScript);
    ast = getAST(wrappedCode);
    const { functionalParams, references, variableDeclarations }: NodeList =
      ancestorWalk(ast);
    const referencesArr = Array.from(references).filter((reference) => {
      // To remove references derived from declared variables and function params,
      // We extract the topLevelIdentifier Eg. Api1.name => Api1
      const topLevelIdentifier = toPath(reference)[0];
      return !(
        functionalParams.has(topLevelIdentifier) ||
        variableDeclarations.has(topLevelIdentifier) ||
        has(invalidIdentifiers, topLevelIdentifier)
      );
    });
    return {
      references: referencesArr,
      functionalParams: Array.from(functionalParams),
      variables: Array.from(variableDeclarations),
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Syntax error. Ignore and return empty list
      return {
        references: [],
        functionalParams: [],
        variables: [],
      };
    }
    throw e;
  }
};

interface functionParam {
  paramName: string;
  defaultValue: unknown;
}

const getFunctionalParamsFromNode = (
  node:
    | FunctionDeclarationNode
    | FunctionExpressionNode
    | ArrowFunctionExpressionNode,
  needValue = false,
): Set<functionParam> => {
  const functionalParams = new Set<functionParam>();
  node.params.forEach((paramNode) => {
    if (isIdentifierNode(paramNode)) {
      functionalParams.add({
        paramName: paramNode.name,
        defaultValue: undefined,
      });
    } else if (isAssignmentPatternNode(paramNode)) {
      if (isIdentifierNode(paramNode.left)) {
        const paramName = paramNode.left.name;
        if (!needValue) {
          functionalParams.add({ paramName, defaultValue: undefined });
        } else {
          // figure out how to get value of paramNode.right for each node type
          // currently we don't use params value, hence skipping it
          // functionalParams.add({
          //   defaultValue: paramNode.right.value,
          // });
        }
      }
    }
  });
  return functionalParams;
};

const constructFinalMemberExpIdentifier = (
  node: MemberExpressionNode,
  child = '',
): string => {
  const propertyAccessor = getPropertyAccessor(node.property);
  if (isIdentifierNode(node.object)) {
    return `${node.object.name}${propertyAccessor}${child}`;
  } else {
    const propertyAccessor = getPropertyAccessor(node.property);
    const nestedChild = `${propertyAccessor}${child}`;
    return constructFinalMemberExpIdentifier(
      node.object as MemberExpressionNode,
      nestedChild,
    );
  }
};

const getPropertyAccessor = (propertyNode: IdentifierNode | LiteralNode) => {
  if (isIdentifierNode(propertyNode)) {
    return `.${propertyNode.name}`;
  } else if (isLiteralNode(propertyNode) && isString(propertyNode.value)) {
    // is string literal search a['b']
    return `.${propertyNode.value}`;
  } else if (isLiteralNode(propertyNode) && isFinite(propertyNode.value)) {
    // is array index search - a[9]
    return `[${propertyNode.value}]`;
  }
};

const ancestorWalk = (ast: Node): NodeList => {
  //List of all Identifier nodes with their property(if exists).
  const identifierList = new Array<RefactorIdentifierNode>();
  // List of all references found
  const references = new Set<string>();
  // List of variables declared within the script. All identifiers and member expressions derived from declared variables will be removed
  const variableDeclarations = new Set<string>();
  // List of functional params declared within the script. All identifiers and member expressions derived from functional params will be removed
  let functionalParams = new Set<string>();

  /*
   * We do an ancestor walk on the AST in order to extract all references. For example, for member expressions and identifiers, we need to know
   * what surrounds the identifier (its parent and ancestors), ancestor walk will give that information in the callback
   * doc: https://github.com/acornjs/acorn/tree/master/acorn-walk
   */
  ancestor(ast, {
    Identifier(node: Node, ancestors: Node[]) {
      /*
       * We are interested in identifiers. Due to the nature of AST, Identifier nodes can
       * also be nested inside MemberExpressions. For deeply nested object references, there
       * could be nesting of many MemberExpressions. To find the final reference, we will
       * try to find the top level MemberExpression that does not have a MemberExpression parent.
       * */
      let candidateTopLevelNode: IdentifierNode | MemberExpressionNode =
        node as IdentifierNode;
      let depth = ancestors.length - 2; // start "depth" with first parent
      while (depth > 0) {
        const parent = ancestors[depth];
        if (
          isMemberExpressionNode(parent) &&
          /* Member expressions that are "computed" (with [ ] search)
             and the ones that have optional chaining ( a.b?.c )
             will be considered top level node.
             We will stop looking for further parents */
          /* "computed" exception - isArrayAccessorNode
             Member expressions that are array accessors with static index - [9]
             will not be considered top level.
             We will continue looking further. */
          (!parent.computed || isArrayAccessorNode(parent)) &&
          !parent.optional
        ) {
          candidateTopLevelNode = parent;
          depth = depth - 1;
        } else {
          // Top level found
          break;
        }
      }
      //If parent is a Member expression then attach property to the Node.
      //else push Identifier Node.
      const parentNode = ancestors[ancestors.length - 2];
      if (isMemberExpressionNode(parentNode)) {
        identifierList.push({
          ...(node as IdentifierNode),
          property: parentNode.property as IdentifierNode,
        });
      } else identifierList.push(node as RefactorIdentifierNode);
      if (isIdentifierNode(candidateTopLevelNode)) {
        // If the node is an Identifier, just save that
        references.add(candidateTopLevelNode.name);
      } else {
        // For MemberExpression Nodes, we will construct a final reference string and then add
        // it to the references list
        const memberExpIdentifier = constructFinalMemberExpIdentifier(
          candidateTopLevelNode,
        );
        references.add(memberExpIdentifier);
      }
    },
    // eslint-disable-next-line
    // @ts-ignore
    VariableDeclarator(node: Node) {
      // keep a track of declared variables so they can be
      // removed from the final list of references
      if (isVariableDeclarator(node)) {
        variableDeclarations.add(node.id.name);
      }
    },
    FunctionDeclaration(node: Node) {
      // params in function declarations are also counted as references so we keep
      // track of them and remove them from the final list of references
      if (!isFunctionDeclaration(node)) return;
      functionalParams = new Set([
        ...functionalParams,
        ...getFunctionalParamNamesFromNode(node),
      ]);
    },
    FunctionExpression(node: Node) {
      // params in function expressions are also counted as references so we keep
      // track of them and remove them from the final list of references
      if (!isFunctionExpression(node)) return;
      functionalParams = new Set([
        ...functionalParams,
        ...getFunctionalParamNamesFromNode(node),
      ]);
    },
    ArrowFunctionExpression(node: Node) {
      // params in arrow function expressions are also counted as references so we keep
      // track of them and remove them from the final list of references
      if (!isArrowFunctionExpression(node)) return;
      functionalParams = new Set([
        ...functionalParams,
        ...getFunctionalParamNamesFromNode(node),
      ]);
    },
  });
  return {
    references,
    functionalParams,
    variableDeclarations,
    identifierList,
  };
};
