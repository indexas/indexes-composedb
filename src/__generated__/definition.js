// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    Index: {
      id: "kjzl6hvfrbw6c55n03lzzpmknkipx90dejbrknmcuawvn9zm63ph9d51e2695c5",
      accountRelation: { type: "list" },
    },
    Link: {
      id: "kjzl6hvfrbw6c9uhdqiy72v7znupiffho3y2h2m1xgr8a8k54rltek192r52rya",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    Index: {
      title: { type: "string", required: true },
      collabAction: { type: "string", required: true },
      version: { type: "view", viewType: "documentVersion" },
      links: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "queryConnection",
          model:
            "kjzl6hvfrbw6c9uhdqiy72v7znupiffho3y2h2m1xgr8a8k54rltek192r52rya",
          property: "indexID",
        },
      },
      linksCount: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "queryCount",
          model:
            "kjzl6hvfrbw6c9uhdqiy72v7znupiffho3y2h2m1xgr8a8k54rltek192r52rya",
          property: "indexID",
        },
      },
    },
    Link: {
      url: { type: "string", required: true },
      tags: {
        type: "list",
        required: false,
        item: { type: "string", required: false },
      },
      title: { type: "string", required: true },
      content: { type: "string", required: true },
      indexID: { type: "streamid", required: true },
      indexer_did: { type: "string", required: true },
      controller_did: { type: "string", required: true },
      index: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "document",
          model:
            "kjzl6hvfrbw6c55n03lzzpmknkipx90dejbrknmcuawvn9zm63ph9d51e2695c5",
          property: "indexID",
        },
      },
      version: { type: "view", viewType: "documentVersion" },
    },
  },
  enums: {},
  accountData: {
    indexList: { type: "connection", name: "Index" },
    linkList: { type: "connection", name: "Link" },
  },
};
