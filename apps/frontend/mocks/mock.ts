/**
 * This file is AUTO GENERATED by [msw-auto-mock](https://github.com/zoubingwu/msw-auto-mock)
 * Feel free to commit/edit it as you need.
 */
/* eslint-disable */
/* tslint:disable */
import { HttpResponse, http } from 'msw';
import { faker } from '@faker-js/faker';

faker.seed(1);

const baseURL = 'http://localhost:3000';
const MAX_ARRAY_LENGTH = 20;

let i = 0;
const next = () => {
  if (i === Number.MAX_SAFE_INTEGER - 1) {
    i = 0;
  }
  return i++;
};

export const handlers = [
  http.post(`${baseURL}/auth/signup`, () => {
    const resultArray = [[null, { status: 201 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/auth/login`, () => {
    const resultArray = [[null, { status: 201 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/auth/login/google`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/auth/login/google-redirect`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.put(`${baseURL}/users`, () => {
    const resultArray = [
      [getUsersControllerUpdateProfile201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/database`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/database`, () => {
    const resultArray = [[null, { status: 201 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/database/:id`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/database/:id`, () => {
    const resultArray = [[null, { status: 201 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.delete(`${baseURL}/workspaces/:workspaceId/database/:id`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces`, () => {
    const resultArray = [
      [getWorkspacesControllerIndex201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces`, () => {
    const resultArray = [
      [getWorkspacesControllerCreate201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.put(`${baseURL}/workspaces/:id`, () => {
    const resultArray = [
      [getWorkspacesControllerUpdate201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/apps`, () => {
    const resultArray = [
      [getAppsControllerCreate201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/apps`, () => {
    const resultArray = [
      [getAppsControllerFindAll201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/apps/:appId`, () => {
    const resultArray = [
      [getAppsControllerFindOne201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/apps/:id/clone`, () => {
    const resultArray = [
      [getAppsControllerClone201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.put(`${baseURL}/workspaces/:workspaceId/apps/:id`, () => {
    const resultArray = [
      [getAppsControllerUpdate201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.delete(`${baseURL}/workspaces/:workspaceId/apps/:id`, () => {
    const resultArray = [
      [getAppsControllerDelete201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/apps/:appId/pages`, () => {
    const resultArray = [
      [getPagesControllerCreate201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/apps/:appId/pages`, () => {
    const resultArray = [
      [getPagesControllerIndex201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/pages/:pageId/clone`,
    () => {
      const resultArray = [
        [getPagesControllerClone201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/pages/:pageId`,
    () => {
      const resultArray = [
        [getPagesControllerFindOne201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.put(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/pages/:pageId`,
    () => {
      const resultArray = [
        [getPagesControllerUpdate201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.delete(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/pages/:pageId`,
    () => {
      const resultArray = [
        [getPagesControllerDelete201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(`${baseURL}/workspaces/:workspaceId/roles`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/workspaces/:workspaceId/roles`, () => {
    const resultArray = [[null, { status: 201 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/roles/:roleId`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.put(`${baseURL}/workspaces/:workspaceId/roles/:roleId`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.delete(`${baseURL}/workspaces/:workspaceId/roles/:roleId`, () => {
    const resultArray = [[null, { status: 200 }]];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.put(
    `${baseURL}/workspaces/:workspaceId/roles/:roleId/togglepermission/:permissionId`,
    () => {
      const resultArray = [[null, { status: 200 }]];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(`${baseURL}/permissions`, () => {
    const resultArray = [
      [getPermissionsControllerIndex201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId`,
    () => {
      const resultArray = [
        [getDataSourcesControllerCreate201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId`,
    () => {
      const resultArray = [
        [getDataSourcesControllerGetOne201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.delete(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId`,
    () => {
      const resultArray = [
        [getDataSourcesControllerDeleteOne201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.put(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId`,
    () => {
      const resultArray = [
        [getDataSourcesControllerUpdate201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId/all`,
    () => {
      const resultArray = [
        [getDataSourcesControllerGetConnections201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.delete(
    `${baseURL}/workspaces/:workspaceId/data-sources/:dataSourceId/all`,
    () => {
      const resultArray = [
        [
          getDataSourcesControllerDeleteConnections201Response(),
          { status: 201 },
        ],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(`${baseURL}/workspaces/:workspaceId/data-sources`, () => {
    const resultArray = [
      [getDataSourcesControllerGetWsDataSources201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(`${baseURL}/data-sources/global`, () => {
    const resultArray = [
      [getGlobalDataSourcesControllerAdd201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/data-sources/global`, () => {
    const resultArray = [
      [getGlobalDataSourcesControllerGetAll201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/data-sources/global/:id`, () => {
    const resultArray = [
      [getGlobalDataSourcesControllerGetOne201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.post(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/queries/run/:queryId`,
    () => {
      const resultArray = [
        [getDataQueriesControllerRunQuery201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.post(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/queries/add`,
    () => {
      const resultArray = [
        [getDataQueriesControllerAddQuery201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.get(`${baseURL}/workspaces/:workspaceId/apps/:appId/queries`, () => {
    const resultArray = [
      [getDataQueriesControllerGetAppQueries201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.delete(`${baseURL}/workspaces/:workspaceId/apps/:appId/queries`, () => {
    const resultArray = [
      [
        getDataQueriesControllerDeleteDataSourceQueries201Response(),
        { status: 201 },
      ],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.get(`${baseURL}/workspaces/:workspaceId/apps/:appId/queries/:id`, () => {
    const resultArray = [
      [getDataQueriesControllerGetQuery201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
  http.delete(
    `${baseURL}/workspaces/:workspaceId/apps/:appId/queries/:id`,
    () => {
      const resultArray = [
        [getDataQueriesControllerDeleteQuery201Response(), { status: 201 }],
      ];

      return HttpResponse.json(...resultArray[next() % resultArray.length]);
    },
  ),
  http.put(`${baseURL}/workspaces/:workspaceId/apps/:appId/queries/:id`, () => {
    const resultArray = [
      [getDataQueriesControllerUpdateQuery201Response(), { status: 201 }],
    ];

    return HttpResponse.json(...resultArray[next() % resultArray.length]);
  }),
];

export function getUsersControllerUpdateProfile201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    username: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: null,
    updatedAt: null,
  };
}

export function getWorkspacesControllerIndex201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getWorkspacesControllerCreate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    imageUrl: faker.image.url(),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getWorkspacesControllerUpdate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    imageUrl: faker.image.url(),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getAppsControllerCreate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
    pages: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
    ].map((_) => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      handle: faker.lorem.slug(1),
      name: faker.person.fullName(),
      enabled: faker.datatype.boolean(),
      visible: faker.datatype.boolean(),
      index: faker.number.int({ min: undefined, max: undefined }),
      appId: faker.number.int({ min: undefined, max: undefined }),
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
      createdById: faker.number.int({ min: undefined, max: undefined }),
      updatedById: faker.number.int({ min: undefined, max: undefined }),
      deletedById: faker.number.int({ min: undefined, max: undefined }),
      tree: [...new Array(5).keys()]
        .map((_) => ({ [faker.lorem.word()]: null }))
        .reduce((acc, next) => Object.assign(acc, next), {}),
    })),
  };
}

export function getAppsControllerFindAll201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getAppsControllerFindOne201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
    pages: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
    ].map((_) => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.person.fullName(),
      handle: faker.lorem.slug(1),
      index: faker.number.int({ min: undefined, max: undefined }),
      enabled: faker.datatype.boolean(),
      visible: faker.datatype.boolean(),
    })),
    defaultPage: {
      id: faker.number.int({ min: undefined, max: undefined }),
      handle: faker.lorem.slug(1),
      name: faker.person.fullName(),
      enabled: faker.datatype.boolean(),
      visible: faker.datatype.boolean(),
      index: faker.number.int({ min: undefined, max: undefined }),
      appId: faker.number.int({ min: undefined, max: undefined }),
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
      createdById: faker.number.int({ min: undefined, max: undefined }),
      updatedById: faker.number.int({ min: undefined, max: undefined }),
      deletedById: faker.number.int({ min: undefined, max: undefined }),
      tree: [...new Array(5).keys()]
        .map((_) => ({ [faker.lorem.word()]: null }))
        .reduce((acc, next) => Object.assign(acc, next), {}),
    },
    createdBy: {
      id: faker.number.int({ min: undefined, max: undefined }),
      username: faker.person.fullName(),
    },
    updatedBy: {
      id: faker.number.int({ min: undefined, max: undefined }),
      username: faker.person.fullName(),
    },
  };
}

export function getAppsControllerClone201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
    pages: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
    ].map((_) => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      handle: faker.lorem.slug(1),
      name: faker.person.fullName(),
      enabled: faker.datatype.boolean(),
      visible: faker.datatype.boolean(),
      index: faker.number.int({ min: undefined, max: undefined }),
      appId: faker.number.int({ min: undefined, max: undefined }),
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
      createdById: faker.number.int({ min: undefined, max: undefined }),
      updatedById: faker.number.int({ min: undefined, max: undefined }),
      deletedById: faker.number.int({ min: undefined, max: undefined }),
      tree: [...new Array(5).keys()]
        .map((_) => ({ [faker.lorem.word()]: null }))
        .reduce((acc, next) => Object.assign(acc, next), {}),
    })),
  };
}

export function getAppsControllerUpdate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getAppsControllerDelete201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getPagesControllerCreate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    handle: faker.lorem.slug(1),
    name: faker.person.fullName(),
    enabled: faker.datatype.boolean(),
    visible: faker.datatype.boolean(),
    index: faker.number.int({ min: undefined, max: undefined }),
    appId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
    tree: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
  };
}

export function getPagesControllerIndex201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getPagesControllerClone201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getPagesControllerFindOne201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    handle: faker.lorem.slug(1),
    name: faker.person.fullName(),
    enabled: faker.datatype.boolean(),
    visible: faker.datatype.boolean(),
    index: faker.number.int({ min: undefined, max: undefined }),
    appId: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    deletedById: faker.number.int({ min: undefined, max: undefined }),
    tree: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
  };
}

export function getPagesControllerUpdate201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getPagesControllerDelete201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getPermissionsControllerIndex201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getDataSourcesControllerCreate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    config: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    createdAt: null,
    updatedAt: null,
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getDataSourcesControllerGetOne201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    config: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    dataSource: {
      id: faker.number.int({ min: undefined, max: undefined }),
      type: faker.helpers.arrayElement([
        'database',
        'api',
        'cloud storage',
        'plugin',
      ]),
      name: faker.person.fullName(),
      config: {
        schema: [...new Array(5).keys()]
          .map((_) => ({ [faker.lorem.word()]: null }))
          .reduce((acc, next) => Object.assign(acc, next), {}),
        uiSchema: [...new Array(5).keys()]
          .map((_) => ({ [faker.lorem.word()]: null }))
          .reduce((acc, next) => Object.assign(acc, next), {}),
      },
      image: faker.lorem.slug(1),
    },
  };
}

export function getDataSourcesControllerDeleteOne201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    config: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    createdAt: null,
    updatedAt: null,
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getDataSourcesControllerUpdate201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    workspaceId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    config: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    createdAt: null,
    updatedAt: null,
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
  };
}

export function getDataSourcesControllerGetConnections201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getDataSourcesControllerDeleteConnections201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getDataSourcesControllerGetWsDataSources201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getGlobalDataSourcesControllerAdd201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    type: faker.helpers.arrayElement([
      'database',
      'api',
      'cloud storage',
      'plugin',
    ]),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    image: faker.lorem.slug(1),
    config: faker.helpers.arrayElement([
      faker.helpers.arrayElement([
        faker.lorem.slug(1),
        faker.number.int({ min: undefined, max: undefined }),
        faker.datatype.boolean(),
        null,
      ]),
      [
        ...new Array(
          faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH }),
        ).keys(),
      ].map((_) => null),
      [...new Array(5).keys()]
        .map((_) => ({ [faker.lorem.word()]: null }))
        .reduce((acc, next) => Object.assign(acc, next), {}),
    ]),
    queryConfig: null,
  };
}

export function getGlobalDataSourcesControllerGetAll201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getGlobalDataSourcesControllerGetOne201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    type: faker.helpers.arrayElement([
      'database',
      'api',
      'cloud storage',
      'plugin',
    ]),
    name: faker.person.fullName(),
    description: faker.lorem.slug(1),
    image: faker.lorem.slug(1),
    config: faker.helpers.arrayElement([
      faker.helpers.arrayElement([
        faker.lorem.slug(1),
        faker.number.int({ min: undefined, max: undefined }),
        faker.datatype.boolean(),
        null,
      ]),
      [
        ...new Array(
          faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH }),
        ).keys(),
      ].map((_) => null),
      [...new Array(5).keys()]
        .map((_) => ({ [faker.lorem.word()]: null }))
        .reduce((acc, next) => Object.assign(acc, next), {}),
    ]),
    queryConfig: null,
  };
}

export function getDataQueriesControllerRunQuery201Response() {
  return {
    status: faker.number.int({ min: undefined, max: undefined }),
    data: null,
    error: faker.lorem.slug(1),
  };
}

export function getDataQueriesControllerAddQuery201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    query: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    appId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
  };
}

export function getDataQueriesControllerGetAppQueries201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getDataQueriesControllerDeleteDataSourceQueries201Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys(),
  ].map((_) => null);
}

export function getDataQueriesControllerGetQuery201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    query: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    appId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
  };
}

export function getDataQueriesControllerDeleteQuery201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    query: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    appId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
  };
}

export function getDataQueriesControllerUpdateQuery201Response() {
  return {
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.person.fullName(),
    query: [...new Array(5).keys()]
      .map((_) => ({ [faker.lorem.word()]: null }))
      .reduce((acc, next) => Object.assign(acc, next), {}),
    appId: faker.number.int({ min: undefined, max: undefined }),
    dataSourceId: faker.number.int({ min: undefined, max: undefined }),
    createdById: faker.number.int({ min: undefined, max: undefined }),
    updatedById: faker.number.int({ min: undefined, max: undefined }),
    createdAt: null,
    updatedAt: null,
  };
}
