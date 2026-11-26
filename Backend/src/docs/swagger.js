const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ResolveX Enterprise Support Ticket System — Interactive API Docs',
    version: '1.0.0',
    description: `Complete, production-ready interactive API documentation for ResolveX.
    
### Default Test Credentials:
- **Admin Email:** \`admin@resolvex.com\` | **Password:** \`Admin@123456\`
- **User Email:** Register via \`/api/auth/register\` or log in with your created credentials.

*Note: In Swagger UI, after running **POST /api/auth/login**, the browser automatically stores your HttpOnly \`accessToken\` cookie, so you can immediately execute all protected endpoints with **"Try it out"** without manually copying tokens!*`,
  },
  servers: [
    {
      url: '/api',
      description: 'ResolveX API Base URL',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'Register, Login, Session Check, Token Refresh, and Logout' },
    { name: 'Tickets (Customer)', description: 'Ticket creation, listing, details, editing, deletion, and activity logs' },
    { name: 'Comments & Communication', description: 'Discussion thread on support tickets' },
    { name: 'Notifications', description: 'Real-time alert notifications and read status updates' },
    { name: 'Admin Operations', description: 'Ticket lifecycle management, escalation, agent assignment, and SLA metrics' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'HttpOnly cookie automatically set upon calling /api/auth/login',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Optional Authorization Bearer token header if testing via external clients',
      },
    },
  },
  paths: {
    // -------------------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------------------
    '/auth/register': {
      post: {
        summary: 'Register a new customer account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Raj Keshkar' },
                  email: { type: 'string', example: 'raj@example.com' },
                  password: { type: 'string', example: 'Password@123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error (e.g. weak password or missing fields)' },
          409: { description: 'Account with email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in user & set HttpOnly cookies',
        description: 'Authenticate with email & password. Sets secure HttpOnly accessToken and refreshToken cookies.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@resolvex.com' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful. Returns user profile and sets cookies.' },
          401: { description: 'Invalid email or password' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // TICKETS (CUSTOMER)
    // -------------------------------------------------------------------------
    '/tickets': {
      post: {
        summary: 'Create a new support ticket (USER role)',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'category'],
                properties: {
                  title: { type: 'string', example: 'Cannot connect to production database cluster' },
                  description: { type: 'string', example: 'Experiencing ECONNREFUSED when trying to connect through replica set endpoint.' },
                  category: {
                    type: 'string',
                    enum: ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'GENERAL'],
                    example: 'TECHNICAL',
                  },
                  priority: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                    example: 'HIGH',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ticket created and background notifications emitted' },
          400: { description: 'Validation failure' },
        },
      },
      get: {
        summary: 'List own submitted tickets with search, filters & pagination',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search title or ticket number' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'GENERAL'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Paginated ticket array' },
        },
      },
    },
    '/tickets/{id}': {
      get: {
        summary: 'Get single ticket details by MongoDB ID',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '67448fe9754580327f123456' },
        ],
        responses: {
          200: { description: 'Full ticket entity with creator and assignee data' },
          404: { description: 'Ticket not found' },
        },
      },
      patch: {
        summary: 'Update ticket details (Editable only if OPEN & owned by caller)',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated: Production DB connection timeout' },
                  description: { type: 'string', example: 'Added logs and trace dump for review.' },
                  category: { type: 'string', enum: ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'GENERAL'], example: 'TECHNICAL' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Ticket successfully updated' },
          400: { description: 'Cannot update ticket that is already IN_PROGRESS, RESOLVED, or CLOSED' },
        },
      },
      delete: {
        summary: 'Delete ticket (Permitted only if status is OPEN & owned by caller)',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Ticket and all cascaded comments/notifications permanently deleted' },
          400: { description: 'Cannot delete ticket once an admin has started working on it' },
        },
      },
    },
    '/tickets/{id}/activity': {
      get: {
        summary: 'Get immutable audit log timeline for a ticket',
        tags: ['Tickets (Customer)'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Chronological timeline of changes made to the ticket' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // COMMENTS
    // -------------------------------------------------------------------------
    '/tickets/{id}/comments': {
      post: {
        summary: 'Post a comment on a ticket thread',
        tags: ['Comments & Communication'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'We have restarted the cluster and connection is restored. Please verify on your end.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Comment saved and notification sent to the counterparty' },
        },
      },
      get: {
        summary: 'Get all comments for a ticket',
        tags: ['Comments & Communication'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Array of comments sorted by date' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // NOTIFICATIONS
    // -------------------------------------------------------------------------
    '/notifications': {
      get: {
        summary: 'Get user notifications & unread count',
        tags: ['Notifications'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'List of alerts and overall unread count' },
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        summary: 'Get current total unread badge count',
        tags: ['Notifications'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Unread badge integer' },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        summary: 'Mark single notification as read',
        tags: ['Notifications'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notification marked as read' },
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        summary: 'Mark all notifications as read for current user',
        tags: ['Notifications'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'All notifications cleared to read status' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // ADMIN OPERATIONS
    // -------------------------------------------------------------------------
    '/admin/dashboard/stats': {
      get: {
        summary: 'Get executive support metrics & charts telemetry (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'KPI counts, priority distributions, and category analytics' },
          403: { description: 'Access denied - ADMIN role required' },
        },
      },
    },
    '/admin/tickets': {
      get: {
        summary: 'Fetch all enterprise tickets across all users (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'GENERAL'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Global ticket repository list' },
        },
      },
    },
    '/admin/tickets/{id}/status': {
      patch: {
        summary: 'Transition ticket state machine status (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
                    example: 'IN_PROGRESS',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated and customer notified' },
        },
      },
    },
    '/admin/tickets/{id}/priority': {
      patch: {
        summary: 'Escalate or modify ticket priority (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['priority'],
                properties: {
                  priority: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                    example: 'URGENT',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Priority escalated and logged' },
        },
      },
    },
    '/admin/tickets/{id}/assign': {
      patch: {
        summary: 'Assign ticket to an Admin support agent (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['assignedTo'],
                properties: {
                  assignedTo: {
                    type: 'string',
                    description: 'MongoDB User ID of the assigned admin agent',
                    example: '67448fe9754580327f654321',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Agent assigned and notification dispatched' },
        },
      },
    },
    '/admin/activity': {
      get: {
        summary: 'Fetch immutable global system audit logs (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'Global audit logs stream' },
        },
      },
    },
    '/admin/admins': {
      get: {
        summary: 'Get list of active support admin agents for assignment dropdowns (ADMIN role)',
        tags: ['Admin Operations'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'Array of admin users' },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'ResolveX API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    })
  );
};

module.exports = setupSwagger;
