import React, {
	createContext,
	useContext,
	useEffect, useMemo, useRef, useState,
} from "react";
import ceramicService from "../services/ceramic-service";
import { ComposeClient } from "@composedb/client";
import { CeramicClient } from "@ceramicnetwork/http-client"
import { definition } from "../src/__generated__/definition.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { Indexes, LinkContentResult, Links } from "../types/entity";
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import socketIoClient, { Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { CID } from "ipfs-http-client";

export type ListenEvents = {
	contentSync: (data: LinkContentResult) => void;
};
export interface CeramicContextState {
}

export interface CeramicContextValue {
	ceramic: any;
	composeClient: any;
	socketConnected: boolean;
	syncedData: any;
	createDoc(doc: Partial<Indexes>): Promise<Indexes | null>;
	updateDoc(streamId: string, content: Partial<Indexes>): Promise<TileDocument<any>>;
	getDocById(streamId: string): Promise<TileDocument<Indexes>>;
	getDocs(streams: { streamId: string }[]): Promise<{ [key: string]: TileDocument<Indexes> }>;
	getProfile(): Promise<BasicProfile | null>;
	setProfile(profile: BasicProfile): Promise<boolean>;
	uploadImage(file: File): Promise<{ cid: CID, path: string } | undefined>
	addLink(streamId: string, data: Links): Promise<[TileDocument<Indexes>, Links[]]>;
	removeLink(streamId: string, linkId: string): Promise<TileDocument<Indexes>>;
	addTag(streamId: string, linkId: string, tag: string): Promise<TileDocument<Indexes> | undefined>;
	removeTag(streamId: string, linkId: string, tag: string): Promise<TileDocument<Indexes> | undefined>;
	setLinkFavorite(streamId: string, linkId: string, favorite: boolean): Promise<TileDocument<Indexes> | undefined>;
	putLinks(streamId: string, links: Links[]): Promise<TileDocument<Indexes>>;
}
export const ceramic = new CeramicClient("http://localhost:7007");
export const composeClient = new ComposeClient({
	ceramic: "http://localhost:7007",
	// cast our definition as a RuntimeCompositeDefinition
	definition: definition as RuntimeCompositeDefinition,
  });
export const CeramicContext = createContext<CeramicContextValue>({ceramic: ceramic, composeClient: composeClient} as any);

const CeramicProvider: React.FC<{}> = ({
	children,
}) => {
	const io = useRef<Socket<ListenEvents, {}>>();
	const authenticated = useAuth();
	const [syncedData, setSyncedData] = useState<LinkContentResult>();

	// Socket Variables
	const [socketConnected, setSocketConnected] = useState(false);
	const handlers: ListenEvents = useMemo(() => ({
		contentSync: async (data) => {
			await ceramicService.syncContents(data);
		},
	}), []);

	const createDoc = async (data: Partial<Indexes>) => {
		try {
			const doc = await ceramicService.createIndex(data);
			return null;
		} catch (err) {
			return null;
		}
	};

	const updateDoc = async (streamId: string, content: Partial<Indexes>) => {
		const updatedDoc = await ceramicService.updateIndex(streamId, content);
		return updatedDoc;
	};

	const addLink = async (streamId: string, link: Links) => ceramicService.addLink(streamId, [link]);

	const removeLink = async (streamId: string, linkId: string) => {
		const updatedDoc = await ceramicService.removeLink(streamId, linkId);
		return updatedDoc;
	};

	const addTag = async (streamId: string, linkId: string, tag: string) => {
		const updatedDoc = await ceramicService.addTag(streamId, linkId, tag);
		return updatedDoc;
	};

	const removeTag = async (streamId: string, linkId: string, tag: string) => {
		const updatedDoc = await ceramicService.removeTag(streamId, linkId, tag);
		return updatedDoc;
	};

	const setLinkFavorite = async (streamId: string, linkId: string, favorite: boolean) => {
		const updatedDoc = await ceramicService.setLinkFavorite(streamId, linkId, favorite);
		return updatedDoc;
	};

	const putLinks = async (streamId: string, links: Links[]) => {
		const updatedDoc = await ceramicService.putLinks(streamId, links);
		return updatedDoc;
	};

	const getDocById = (streamId: string) => ceramicService.getIndexById(streamId);
	

	const getDocs = (streams: { streamId: string }[]) => ceramicService.getIndexes(streams);

	const getProfile = async () => ceramicService.getProfile();

	const setProfile = async (profile: BasicProfile) => ceramicService.setProfile(profile);

	const uploadImage = async (file: File) => ceramicService.uploadImage(file);
	/*const hostnameCheck = () : string => {
		if (typeof window !== "undefined") {
			if (window.location.hostname === "testnet.index.as") {
				return appConfig.baseUrl;
			}
			if (window.location.hostname === "dev.index.as" || window.location.hostname === "localhost") {
				return appConfig.devBaseUrl;
			}
		  }
		  return appConfig.baseUrl;
	};
	*/
	useEffect(() => {
		if (authenticated) {
			if (io.current && io.current.connected) {
				io.current.removeAllListeners();
				io.current.disconnect();
			}

			
		}  if (io.current && io.current!.connected) {
			io.current!.removeAllListeners();
			io.current!.disconnect();
		}

		return () => {
			if (io.current && io.current.connected) {
				io.current!.disconnect();
			}
		};
	}, [authenticated]);

	return (
		<CeramicContext.Provider value={{
			socketConnected,
			syncedData,
			createDoc,
			updateDoc,
			getDocById,
			getDocs,
			addTag,
			addLink,
			getProfile,
			setProfile,
			putLinks,
			setLinkFavorite,
			removeLink,
			removeTag,
			uploadImage,
			ceramic,
			composeClient,
		}}>
			{children}
		</CeramicContext.Provider>
	);
};
export const useCeramicContext = () => useContext(CeramicContext);
export default CeramicProvider;
