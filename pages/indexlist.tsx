import { useRouter } from "next/router";
import { ComposeClient } from "@composedb/client";
import { definition } from "/Users/furkanozelge/dev/jscer/try/src/__generated__/definition.js";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Context } from "@composedb/client";
import { useEffect, useState } from "react";
import { useCeramicContext } from "../context/index";
import style from "/Users/furkanozelge/dev/littttttttttt/indexes-composedb/styles/Home.module.css";
interface IndexData {
  id: string;
  title: string;
}
const IndexPage = () => {
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [cond, setCond] = useState(false);
  const [indexRouter, setIndexRouter] = useState("");
  const [indexData, setIndexData] = useState<Array<IndexData | undefined>>([]);
  useEffect(() => {
    readIndexes();
  }, []);

  async function readIndexes() {
    const result = await composeClient.executeQuery(`{
        viewer{
            indexList(first:100){
              edges{
                node{
                  id
                  title
                  createdAt
                  userID
                }
              }
            }
        }}`);
    console.log(result.data.viewer.indexList.edges);
    setTitle(result.data.viewer);
    setIndexData(result.data.viewer.indexList.edges);
  }
  return (
    <>
 {
      cond ? 
      (() => {
        try {
          router.push(`/indexes/${indexRouter}`);
          return <h1>index.as</h1>;
        } catch (error) {
          console.error(error);
          return <h1>An error occurred</h1>;
        }
      })()
      
      : 
      <h1>index.as</h1>
    }
  
        {indexData.map((index) => {
          const list = (
            <>
              <ul>
                <li>
                  <button
                    onClick={() => {
                      setIndexRouter(index.node.id);
                      setCond(true);
                    }}
                  >
                    Go to this Index Page
                  </button>
                </li>
                <li>ID: {index.node.id}</li>
                <li>Title: {index.node.title}</li>
              </ul>
              <hr />
            </>
          );
          return list;
        })}
      </>
    );
  
};

export default IndexPage;
