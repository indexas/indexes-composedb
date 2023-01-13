import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import {BrowserRouter as Router, Route} from "react-router-dom";
import { ComposeClient } from '@composedb/client'
import ceramicLogo from "../public/ceramic.png";
import { useCeramicContext } from "../context/CeramicProvider";
import { authenticateCeramic } from "../utils";
import styles from "../styles/Home.module.css";
import type { BasicIndex } from "./BasicIndex";
import type { BasicLink } from "./BasicLink";
import { useRouter } from "next/router";
import { compose } from "@reduxjs/toolkit";
import { Indexes } from "../types/entity";
import {ceramic, composeClient} from "../context/CeramicProvider";
import { useMergedState } from "../hooks/useMergedState";
import { useCeramic } from "../hooks/useCeramic";

const Home: NextPage = () => {
  const composedb = useCeramic();
  const [profile, setProfile] = useState<BasicProfile | undefined>();
  const [index, setIndex] = useState<BasicIndex | undefined>();
  const [link, setLink] = useState<BasicLink | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

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
              version
              collabAction
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
              indexer_did
              url
              title
              tags
              version
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
        console.log(index);
        const doc = await composedb.createDoc(index as Indexes);
        if(doc != null){
          console.log(doc);
        }
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
              indexer_did: "${link?.indexer_did}"
              url: "${link?.url}"
              title: "${link?.title}"
              tags: "${link?.tags}"
              version: "${link?.version}"
              content: "${link?.content}"
            }
          }) 
          {
            document {
              indexID
              indexer_did
              url
              title
              tags
              version
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
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Version</label>
              <input
                type="text"
                defaultValue={index?.version || ""} 
                onChange={(e) => {
                  setIndex({ ...index, version: e.target.value });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Collab Action</label>
              <input
                type="text"
                defaultValue={index?.collabAction || ""}
                onChange={(e) => {
                  setIndex({ ...index, collabAction: e.target.value });
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
            </div>
            <div className={styles.buttonContainer}>
              <button
                onClick={() => {
                  router.push("/indexlist")
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
