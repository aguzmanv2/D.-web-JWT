import express from 'express';
import { graphql } from 'graphql';
import { schema } from '../graphql/schema.js';
import { root } from '../graphql/resolvers.js';
import { getGraphQLContext } from '../graphql/context.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query, variables, operationName } = req.body ?? {};

    if (!query) {
      return res.status(400).json({
        errors: [{ message: 'La propiedad query es obligatoria' }]
      });
    }

    const result = await graphql({
      schema,
      source: query,
      rootValue: root,
      contextValue: getGraphQLContext(req),
      variableValues: variables,
      operationName
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      errors: [{ message: 'Error al ejecutar GraphQL', detail: error.message }]
    });
  }
});

export default router;
