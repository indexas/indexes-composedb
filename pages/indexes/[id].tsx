import { useRouter } from "next/router";
import { ComposeClient } from "@composedb/client";
import { definition } from "/Users/furkanozelge/dev/jscer/try/src/__generated__/definition.js";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Context } from "@composedb/client";
import { compose } from "../compose";
import { useEffect, useState } from "react";
import {ceramic,composeClient} from "../../context/CeramicProvider";
import style from "../../styles/Home.module.css";
import type { BasicLink } from "../BasicLink";
import type { BasicIndex } from "../BasicIndex";
import { authenticateCeramic } from "../../utils";
import { useCeramic } from "../../hooks/useCeramic";
import { Indexes } from "../../types/entity";
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
  const composedb = useCeramic();
  const [linkdata, setLinkdata] = useState<Array<LinkData | undefined>>([]);
  const [data, setData] = useState("");
  const [title, setTitle] = useState("");
  const [userID, setUserID] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [users, setUsers] = useState("");

  //links
  const [linkuser,setLinkuser] =useState("");
  const [linkID, setLinkID] = useState("");
  const [linktitle, setLinktitle] = useState("");
  const [linkurl, setLinkurl] = useState("");
  const [linkcreatedAt, setLinkcreatedAt] = useState("");
  const [linkupdatedAt, setLinkupdatedAt] = useState("");
  const [linkcontent, setLinkcontent] = useState("");
  const [linktags, setLinktags] = useState("");

  const [index, setIndex] = useState<BasicIndex | undefined>();
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     readData();
  //     readLink();
  //   },10000);
  // }, [])
  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);

   // await readData();
   // await readLink();
  };
  useEffect(() => {
    
    if (localStorage.getItem("did")) {
      handleLogin();
    }
  }, []);

  const streamIDs = router.query.id;

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
      node(id:"${streamIDs}"){
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
    //console.log(result.data.node.links.edges);
    //setLinkdata(result.data.node.links.edges);
  }

  async function readData() {
    const doc = await composedb.getDocById(streamIDs as string);
   /* const result = await composeClient.executeQuery(`{
      node(id:"${streamIDs}"){
        id
        ... on Index{
          title
          userID
          createdAt
      }}
    }`);
*/
    //setData(result.data.node);
    //console.log(data);
    //setTitle(result.data.node.title);
    //setUserID(result.data.node.userID);
    //setCreatedAt(result.data.node.createdAt);
  }
 

  const updateIndexTitle = async () => {

      const doc = await composedb.updateDoc(streamIDs as string,index as Indexes);
      await getIndex();

  };
  //LINKS
  const updateLink = async () => {
    if (ceramic.did !== undefined && ceramic.did.id === userID) {
    const updatelink = await composeClient.executeQuery(`
        mutation {
          createLink(input: {
            content: {
              indexID: "${streamIDs}"
              users: "${linkuser}"
              url: "${linkurl}"
              title: "${linktitle}"
              tags: "${linktags}"
              createdAt: "${linkcreatedAt}"
              updatedAt: "${linkupdatedAt}"
              content: "${linkcontent}"
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
      }
      else{
        console.log("UserID != Your DID");
      }
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
    <div className={style.container}>
      <div className={style.form}>
        <div className={style.formGroup}>
          <button
            onClick={()=>{
              handleLogin();
            }}>
              LOGIN
          </button>
          <button
            onClick={() => {
              readData();
              //readLink();
            }}
          >
             FETCH INDEX
          </button>
          <div className={style.formGroup}>
          <input
            type="text"
            defaultValue={index?.title || ""}
            onChange={(e) => {
              setIndex({ ...index, title: e.target.value });
              //setTitle(e.target.value);
            }}
          />
          </div>
          <button
            onClick={() => {
              updateIndexTitle();
            }}
          >
            {" "}
            Click to Change{" "}
          </button>
        </div>
        <h2>ID : </h2>
        <h3>{router.query.id}</h3>
        <h2>Index Title: </h2>
        <h3>{title}</h3>
        <h4>Indexer ID: {userID}</h4>
        <h4>Created At: {createdAt}</h4>
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


        <h1> Create Link </h1>
        <div className={style.form}>
        <h3>Link Users</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          value={link?.users || ""}
          onChange={(e) => {
            setLink({ ...link, users: e.target.value });
            setLinkuser(e.target.value);
          }}
        ></input>
        </div>
        <h3>Link URL</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.url || ""}
          onChange={(e) => {
            setLink({ ...link, url: e.target.value });
            setLinkurl(e.target.value);
          }}
        />
        </div>
        <h3>Link title</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.title || ""}
          onChange={(e) => {
            setLink({ ...link, title: e.target.value });
            setLinktitle(e.target.value);
          }}
        />
        </div>
        <h3>Link UpdatedAt</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.updatedAt || ""}
          onChange={(e) => {
            setLink({ ...link, updatedAt: e.target.value });
            setLinkupdatedAt(e.target.value);
          }}
        />
        </div>
        <h3>Link Createdat</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.createdAt || ""}
          onChange={(e) => {
            setLink({ ...link, createdAt: e.target.value });
            setLinkcreatedAt(e.target.value);
          }}
        />
        </div>
        <h3>Link Tags</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.tags || ""}
          onChange={(e) => {
            setLink({ ...link, tags: e.target.value });
            setLinktags(e.target.value);
          }}
        />
        </div>
        <h3>Link Content</h3>
        <div className={style.formGroup}>
        <input
          type="text"
          defaultValue={link?.content || ""}
          onChange={(e) => {
            setLink({ ...link, content: e.target.value });
            setLinkcontent(e.target.value);
          }}
        />
        </div>
        <button onClick={updateLink}>Add Link</button>
      </div>
      </div>
      </div>
    </>
  );
}
export default ID;
