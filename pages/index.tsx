import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import {BrowserRouter as Router, Route} from "react-router-dom";
import { ComposeClient } from '@composedb/client'
import ceramicLogo from "../public/ceramic.png";
import { useCeramicContext } from "../context";
import { authenticateCeramic } from "../utils";
import styles from "../styles/Home.module.css";
import type { BasicIndex } from "./BasicIndex";
import type { BasicLink } from "./BasicLink";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [profile, setProfile] = useState<BasicProfile | undefined>();
  const [index, setIndex] = useState<BasicIndex | undefined>();
  const [link, setLink] = useState<BasicLink | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [title,setTitle] = useState("");
  const [userID,setUserID] = useState("");
  const [createdAt,setCreatedAt] = useState("");

  const router = useRouter();
  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    await getProfile();
    await getIndex();
    await getLink();
  };

  const getIndex = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };
  const getLink = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const getProfile = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              description
              gender
              emoji
            }
          }
        }
      `);

      setProfile(profile?.data?.viewer?.basicProfile);
      setLoading(false);
    }
  };
  const updateIndex = async () => {

    setLoading(true);
    if (ceramic.did !== undefined) {
      const updateindex = await composeClient.executeQuery(`
        mutation {
          createIndex(input: {
            content: {
              title: "${title}"
              userID: "${userID}"
              createdAt: "${createdAt}"
            }
          }) 
          {
            document {
              title
              userID
              createdAt
            }
          }
        }
      `);
      await getIndex();
      setLoading(false);
    }
  };
  const updateLink = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const updatelink = await composeClient.executeQuery(`
        mutation {
          createLink(input: {
            content: {
              indexID: "${link?.indexID}"
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
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const update = await composeClient.executeQuery(`
        mutation {
          createBasicProfile(input: {
            content: {
              name: "${profile?.name}"
              description: "${profile?.description}"
              gender: "${profile?.gender}"
              emoji: "${profile?.emoji}"
            }
          }) 
          {
            document {
              name
              description
              gender
              emoji
            }
          }
        }
      `);
      await getProfile();
      setLoading(false);
    }
  };

  /**
   * On load check if there is a DID-Session in local storage.
   * If there is a DID-Session we can immediately authenticate the user.
   * For more details on how we do this check the 'authenticateCeramic function in`../utils`.
   */
  useEffect(() => {
    if (localStorage.getItem("did")) {
      handleLogin();
    }
  }, []);

  return (
    
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create ceramic app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Your Decentralized Profile</h1>
        <Image
          src={ceramicLogo}
          width="100"
          height="100"
          className={styles.logo}
        />
        {profile === undefined && ceramic.did === undefined ? (
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        ) : (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Index Title</label>
              <input
                type="text"
                defaultValue={index?.title || ""}
                onChange={(e) => {
                  setIndex({ ...index, title: e.target.value });
                  setTitle(e.target.value);
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Index UserID</label>
              <input
                type="text"
                defaultValue={index?.userID || ""}
                onChange={(e) => {
                  setIndex({ ...index, userID: e.target.value });
                  setUserID(e.target.value);
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Index CreatedAt</label>
              <input
                type="text"
                defaultValue={index?.createdAt || ""}
                onChange={(e) => {
                  setIndex({ ...index, createdAt: e.target.value });
                  setCreatedAt(e.target.value);
                }}
              />
            </div>


            <div className={styles.buttonContainer}>
              <button
                onClick={() => {
                  updateIndex();
                  //updateLink();
                  //updateProfile();
                }}
              >
                {loading ? "Loading..." : "Create Index"}
              </button>
            </div>
            <div className={styles.buttonContainer}>
              <button
                onClick={() => {
                  getIndex();
                  getLink();
                }}
              >
                {loading ? "Loading..." : "Show Indexes and Links"}
              </button>
            </div>
            <div className={styles.buttonContainer}>
              <button
                onClick={() => {
                  router.push("/indexes")
                }}
              >
                {"Index Page"}
              </button>
            </div>
          
          </div>
        )}
      </main>
    </div>

  );
};

export default Home;
