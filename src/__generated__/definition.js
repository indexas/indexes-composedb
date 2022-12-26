// This is an auto-generated file, do not edit manually
export const definition = {
    models: {
      Index: {
        id: "kjzl6hvfrbw6c79v4kc8c3ws492ggnn08kic9b9m1w8cofycsucropm9uvpjsy6",
        accountRelation: { type: "list" },
      },
      Link: {
        id: "kjzl6hvfrbw6c7guh3pf8xoaxilxoo1ib89u6fpx5jzqjy4ehdu93u2blpab4dx",
        accountRelation: { type: "list" },
      },
      BasicProfile: {
        id: "kjzl6hvfrbw6c95acf4ixduskim2dj3i83e8i8k2bew80wspcgeeu92sa85kovq",
        accountRelation: { type: "single" },
      },
    },
    objects: {
      Index: {
        title: { type: "string", required: true },
        userID: { type: "string", required: true },
        createdAt: { type: "string", required: true },
        links: {
          type: "view",
          viewType: "relation",
          relation: {
            source: "queryConnection",
            model:
              "kjzl6hvfrbw6c7guh3pf8xoaxilxoo1ib89u6fpx5jzqjy4ehdu93u2blpab4dx",
            property: "indexID",
          },
        },
      },
      Link: {
        url: { type: "string", required: true },
        tags: { type: "string", required: true },
        title: { type: "string", required: true },
        users: { type: "string", required: true },
        content: { type: "string", required: true },
        indexID: { type: "streamid", required: true },
        createdAt: { type: "string", required: true },
        updatedAt: { type: "string", required: true },
        index: {
          type: "view",
          viewType: "relation",
          relation: {
            source: "document",
            model:
              "kjzl6hvfrbw6c79v4kc8c3ws492ggnn08kic9b9m1w8cofycsucropm9uvpjsy6",
            property: "indexID",
          },
        },
      },
      BasicProfile: {
        name: { type: "string", required: true },
        emoji: { type: "string", required: false },
        gender: { type: "string", required: false },
        description: { type: "string", required: false },
      },
    },
    enums: {},
    accountData: {
      indexList: { type: "connection", name: "Index" },
      linkList: { type: "connection", name: "Link" },
      basicProfile: { type: "node", name: "BasicProfile" },
    },
  };
  