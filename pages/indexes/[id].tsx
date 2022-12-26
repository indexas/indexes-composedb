import { useRouter } from "next/router";
import { ComposeClient } from "@composedb/client";
import { definition } from "/Users/furkanozelge/dev/jscer/try/src/__generated__/definition.js";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Context } from '@composedb/client'
import { compose } from "../compose";
import { useEffect, useState } from "react";
import { useCeramicContext } from "../../context";

function ID() {
  const router = useRouter();
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [data,setData] = useState();
  const [title,setTitle] = useState();
  const [userID,setUserID] = useState();
  const [createdAt, setCreatedAt] = useState();
  const [titleInput,setTitleInput] = useState('');
  const streamIDs: string = router.query.id as string;
  async function readData(){
    const result = await compose.executeQuery(`{
      node(id:"kjzl6kcym7w8y9iog8u4hnaaajrfof7vt20v8wo6iith560fom0uz390u7esxib"){
        id
        ... on Index{
          title
          userID
          createdAt
      }}
    }`)
    
    setData(result.data.node);
    setTitle(result.data.node.title);
    setUserID(result.data.node.userID);
    setCreatedAt(result.data.node.createdAt);
  }
  useEffect(()=>{
    readData();
  });

 const updateIndex = async () => {
      const updateindex = await compose.executeQuery(`
        mutation {
          updateIndex(input: {
            id: "kjzl6kcym7w8y9iog8u4hnaaajrfof7vt20v8wo6iith560fom0uz390u7esxib"
            content: {
              title: "${titleInput}"
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
    
  };

  
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
        <input 
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          ></input>
          <button onClick={updateIndex}> Click to Change </button>
        </div>
        <h1>new title : {titleInput}</h1>
        <h1>ID : {router.query.id}</h1>
        <h2>Index Title: {title}</h2>
        <h2>User ID: {userID}</h2>
        <h2>Created At: {createdAt}</h2>
      
      </div>  
      
    </>
  );
}

export default ID;
