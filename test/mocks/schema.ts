/*!
 * ISC License
 *
 * Copyright (c) 2018-present, Mykhailo Stadnyk <mikhus@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';
import {
    connectionDefinitions,
    connectionArgs,
    nodeDefinitions,
    fromGlobalId,
    globalIdField,
    connectionFromArray,
} from 'graphql-relay';

export const resolveInfo: any[] = [];

export const { nodeInterface, nodeField } = nodeDefinitions(async (
    globalId: string
) => {
    const { type, id } = fromGlobalId(globalId);
    let node: any = null;

    if (type === 'User') {
        node =  {
            id,
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1-555-555-5555',
            email: 'john@doe.com'
        };
    }

    return node;
});

const User = new GraphQLObjectType({
    name: 'User',
    interfaces: [nodeInterface],
    fields: {
        id: globalIdField('User', (user: any) => user.id),
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        email: { type: GraphQLString },
    }
});

export const { connectionType: userConnection } =
    connectionDefinitions({ nodeType: User });

const Viewer = new GraphQLObjectType({
    name: 'Viewer',
    fields: {
        users: {
            type: userConnection,
            args: { ...connectionArgs },
        },
    },
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        viewer: {
            type: Viewer,
            resolve(src: any, args: any, context: any, info: any) {
                resolveInfo.push(info);
                return connectionFromArray([], args);
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: Query
});

export const query = `
query UsersQuery {
  viewer {
    users {
        ...PageInfo
        ...UserData
    }
  }
}
fragment PageInfo on UserConnection {
  pageInfo {
    startCursor
    endCursor
    hasNextPage
  }
}
fragment UserContacts on User {
  phoneNumber
  email
}
fragment UserData on UserConnection {
  edges {
    node {
      id
      firstName
      lastName
      ...UserContacts
    }
  }
}
`;
