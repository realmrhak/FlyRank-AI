import swaggerJsdoc from 'swagger-jsdoc';

// Swagger/OpenAPI configuration — kept separate from index.js to keep the server file focused on routes/logic
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task CRUD API',
      version: '1.0.0',
      description: 'A simple CRUD API for managing tasks, with Supabase-backed authentication',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js'], // JSDoc comments above each route in index.js are read from here
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;