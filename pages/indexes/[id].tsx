import { useRouter } from "next/router";
import { ComposeClient } from "@composedb/client";
import { definition } from "/Users/furkanozelge/dev/jscer/try/src/__generated__/definition.js";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Context } from "@composedb/client";
import { compose } from "../compose";
import { useEffect, useState } from "react";
import { useCeramicContext } from "../../context";
import type { BasicLink } from "../BasicLink";
import type { BasicIndex } from "../BasicIndex";
import { authenticateCeramic } from "../../utils";
interface LinkData {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  content: string;
}
function ID() {
  const router = useRouter();
  const [link, setLink] = useState<BasicLink | undefined>();
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [linkdata, setLinkdata] = useState<Array<LinkData | undefined>>([]);
  const [data, setData] = useState("");
  const [title, setTitle] = useState("");
  const [userID, setUserID] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [users, setUsers] = useState("");
  //links

  const [linkID, setlinkID] = useState("");
  const [linktitle, setlinktitle] = useState("");
  const [linkurl, setlinkurl] = useState("");
  const [linkcreatedAt, setlinkcreatedAt] = useState("");
  const [linkupdatedAt, setlinkupdatedAt] = useState("");
  const [linkcontent, setlinkcontent] = useState("");

  const [index, setIndex] = useState<BasicIndex | undefined>();
  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    await readData();
    await readLink();
  };

  const streamIDs: string = router.query.id as string;
  const getLink = async () => {
    if (ceramic.did !== undefined) {
      const link = await composeClient.executeQuery(`
        query {
          viewer {
            basicLink {
              indexID
              users
              url
              title
              tags
              createdAt
              updatedAt
              content
            }
          }
        }
      `);

      setLink(link?.data?.viewer?.basicLink);
    }
  };
  const getIndex = async () => {
    if (ceramic.did !== undefined) {
      const index = await composeClient.executeQuery(`
        query {
          viewer {
            basicIndex {
              id
              title
              userID
              createdAt
            }
          }
        }
      `);

      setIndex(index?.data?.viewer?.basicIndex);
    }
  };

  async function readLink() {
    const result = await composeClient.executeQuery(`{
      node(id:"kjzl6kcym7w8y62i50yuxpqllqry2ck0bact938ukvlwcj93mjmpdta2e3uyyuf"){
        id
        ... on Index{
          title
          userID
          createdAt
          links(first:10){
            edges{
              node{
                id
                title
                url
                createdAt
                updatedAt
                content
              }
            }
          }
      }}
    }`);
    console.log(result.data.node.links.edges);
    setLinkdata(result.data.node.links.edges);
  }

  async function readData() {
    const result = await composeClient.executeQuery(`{
      node(id:"kjzl6kcym7w8y62i50yuxpqllqry2ck0bact938ukvlwcj93mjmpdta2e3uyyuf"){
        id
        ... on Index{
          title
          userID
          createdAt
      }}
    }`);

    setData(result.data.node);
    setTitle(result.data.node.title);
    setUserID(result.data.node.userID);
    setCreatedAt(result.data.node.createdAt);
  }
  useEffect(() => {
    if (localStorage.getItem("did")) {
      handleLogin();
    }
  }, []);

  const updateIndexTitle = async () => {
    if (ceramic.did !== undefined) {
      const updateindex = await composeClient.executeQuery(`
      mutation {
        updateIndex(input: {
          id: "kjzl6kcym7w8y62i50yuxpqllqry2ck0bact938ukvlwcj93mjmpdta2e3uyyuf"
          content: {
            title: "${index?.title}"
          }
        }) 
        {
          document {
            id
            title
          }
        }
      }
    `);
      await getIndex();
    }
  };
  //LINKS
  const updateLink = async () => {
    const updatelink = await composeClient.executeQuery(`
        mutation {
          createLink(input: {
            content: {
              indexID: "kjzl6kcym7w8y62i50yuxpqllqry2ck0bact938ukvlwcj93mjmpdta2e3uyyuf"
              users: "${link?.users}"
              url: "${link?.url}"
              title: "${link?.title}"
              tags: "${link?.tags}"
              createdAt: "${link?.createdAt}"
              updatedAt: "${link?.updatedAt}"
              content: "${link?.content}"
            }
          }) 
          {
            document {
              indexID
              users
              url
              title
              tags
              createdAt
              updatedAt
              content
            }
          }
        }
      `);
    await getLink();
  };
  function logElements(elements: string[]) {
    elements.forEach(element => {
      console.log(element)
    });
  }

  /*const [data, setData] = useState();
  const api = "http://localhost:35000/graphql";
  const query = `{
    node(id:"kjzl6kcym7w8y88etqhsdu9ve0oydgwq82mksylv1p2h9vmdhu223ninw17klri"){
      id
      ... on Index{
        title
        userID
        createdAt
      }
    }
  }`;
  
  const getData = () => {
    fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
      }),
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);
  };
  console.log(data);
  */
  return (
    <>
      <div>
        <div>
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
          <input
            type="text"
            defaultValue={index?.title || ""}
            onChange={(e) => {
              setIndex({ ...index, title: e.target.value });
            }}
          />
          <button
            onClick={() => {
              updateIndexTitle();
            }}
          >
            {" "}
            Click to Change{" "}
          </button>
        </div>
        <h1>new title : {titleInput}</h1>
        <h1>ID : {router.query.id}</h1>
        <h2>Index Title: {title}</h2>
        <h2>User ID: {userID}</h2>
        <h2>Created At: {createdAt}</h2>
        <br></br>
        <br></br>
        <br></br>
       
      {linkdata.map((link) => {
        const list = (
          <>
            <ul>
              <li>ID: {link?.node.id}</li>
              <li>TITLE: {link?.node.title}</li>
              <li>CONTENT: {link?.node.content}</li>
              <li>CREATEDAT: {link?.node.createdAt}</li>
            </ul>
            <hr />
          </>
        );
        return list;
      })}


        <h1> CREATE NEW LINK ON YOUR INDEX </h1>
        <h3>Link Users</h3>
        <input
          type="text"
          value={users}
          onChange={(e) => setUsers(e.target.value)}
        ></input>
        <h3>Link URL</h3>
        <input
          type="text"
          defaultValue={link?.url || ""}
          onChange={(e) => {
            setLink({ ...link, url: e.target.value });
          }}
        />
        <h3>Link title</h3>
        <input
          type="text"
          defaultValue={link?.title || ""}
          onChange={(e) => {
            setLink({ ...link, title: e.target.value });
          }}
        />
        <h3>Link UpdatedAt</h3>
        <input
          type="text"
          defaultValue={link?.updatedAt || ""}
          onChange={(e) => {
            setLink({ ...link, updatedAt: e.target.value });
          }}
        />
        <h3>Link Createdat</h3>
        <input
          type="text"
          defaultValue={link?.createdAt || ""}
          onChange={(e) => {
            setLink({ ...link, createdAt: e.target.value });
          }}
        />
        <h3>Link Tags</h3>
        <input
          type="text"
          defaultValue={link?.tags || ""}
          onChange={(e) => {
            setLink({ ...link, tags: e.target.value });
          }}
        />
        <h3>Link Content</h3>
        <input
          type="text"
          defaultValue={link?.content || ""}
          onChange={(e) => {
            setLink({ ...link, content: e.target.value });
          }}
        />
        <button onClick={updateLink}>Add Link</button>
      </div>
    </>
  );
}
export default ID;
