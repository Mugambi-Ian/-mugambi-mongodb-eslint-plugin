// no-wrong-comparison.js
module.exports = {
  name: "check-wrong-comparison",
  meta: {
    schema: [],
    type: "problem",
    docs: {
      description:
        "Comparing ObjectId requires using the equals function not === operator.",
      recommended: "warn",
    },
    messages: {
      useEqualsFunc:
        "Comparing ObjectId requires using the equals function not === operator. ie x.equals(y) not x === y",
      invalidComparison:
        "Comparing ObjectId to null or false value will always be false",
    },
  },
  create(context) {
    let validVariables = {},
      invalidVariables = {};

    const checkExpressionType = (type, operator) =>
      type === "BinaryExpression" && operator === "===";

    const checkIfValid = (left, right) => {
      return {
        all:
          !(!validVariables[left] && !validVariables[right]) ||
          //check false right
          !(!validVariables[left] && !invalidVariables[right]) ||
          //check false left
          !(!invalidVariables[left] && !validVariables[right]),
        varialbles: validVariables[left] && validVariables[right],
      };
    };

    return {
      IfStatement(node) {
        const eType = node.test.type;
        const eLeft = node.test.left;
        const eRight = node.test.right;
        const eOperator = node.test.operator;
        if (
          checkExpressionType(eType, eOperator) &&
          checkIfValid(eLeft.name, eRight.name).all
        ) {
          const isNull = checkIfValid(eLeft.name, eRight.name).varialbles;
          console.log(validVariables,invalidVariables);
          context.report({
            node: node.test,
            messageId: isNull ? "useEqualsFunc" : "invalidComparison",
          });
        }
      },
      VariableDeclaration(node) {
        for (let i = 0; i < node.declarations.length; i++) {
          const declaration = node.declarations[i];
          const init = declaration["init"];
          const id = declaration["id"];
          const varName = id["name"];

          const callee = init["callee"];
          if (callee && callee["name"] === "ObjectId") {
            validVariables[varName] = varName;
          }

          const value = init["value"];
          if (value === false || value === null) {
            invalidVariables[varName] = varName;
          }
        }
      },

      ExpressionStatement(node) {
        const eType = node.expression.type;
        const eLeft = node.expression.left;
        const eRight = node.expression.right;
        const eOperator = node.expression.operator;

        //check binary expression
        if (
          checkExpressionType(eType, eOperator) &&
          checkIfValid(eLeft.name, eRight.name).all
        ) {
          const checkNull = checkIfValid(eLeft.name, eRight.name).varialbles;
          context.report({
            node: node.expression,
            messageId: checkNull ? "useEqualsFunc" : "invalidComparison",
          });
          console.log(validVariables);
        }

        //check value change and update invalid variables
        if (
          eType === "AssignmentExpression" &&
          validVariables[eLeft.name] &&
          (eRight.value === false || eRight.value === null)
        ) {
          const name = eLeft["name"];
          if (validVariables[name]) delete validVariables[name];
          invalidVariables[name] = name;
        }

        //check value change and update valid variables
        if (
          eType === "AssignmentExpression" &&
          !validVariables[eLeft.name] &&
          ((eRight["callee"] && eRight["callee"]["name"] === "ObjectId") ||
            validVariables[eRight.name])
        ) {
          const name = eLeft.name;
          if (invalidVariables[name]) delete invalidVariables[name];
          validVariables[name] = name;
        }

        //check boolean assignment
        if (
          eRight &&
          checkExpressionType(eRight["type"], eRight["operator"]) &&
          checkIfValid(eRight["left"]["name"], eRight["right"]["name"]).all
        ) {
          const checkNull = (eRight["left"]["name"], eRight["right"]["name"])
            .varialbles;
          context.report({
            node: eRight,
            messageId: checkNull ? "useEqualsFunc" : "invalidComparison",
          });
        }
      },
    };
  },

  defaultOptions: [],
};
