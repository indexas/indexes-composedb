import { EthereumAuthProvider } from "@3id/connect";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { SelfID, WebClient } from "@self.id/web";
import { Indexes, LinkContentResult, Links } from "../types/entity";
import { prepareLinks, isSSR, setDates } from "../utils/helper";

import { definition } from "../src/__generated__/definition.js";
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import { DID } from "dids";
import { create, IPFSHTTPClient } from "ipfs-http-client";
import { appConfig } from "../config";
import {CeramicContext, ceramic, composeClient} from "../context/CeramicProvider"
class CeramicService2 {
	hostnameCheck = () : string => {
		if (typeof window !== "undefined") {
			if (window.location.hostname === "testnet.index.as") {
				return appConfig.ceramicNode;
			}
			if (window.location.hostname === "dev.index.as" || window.location.hostname === "localhost") {
				return appConfig.devCeramicNode;
			}
		  }
		  return appConfig.ceramicNode;
	};
	private account?: string;
	private ipfs: IPFSHTTPClient = create({
		url: appConfig.ipfsInfura,
	});
	private client = (isSSR() ? undefined : new WebClient({
		ceramic: this.hostnameCheck(),
		connectNetwork: appConfig.ceramicNetworkName as any,
	})) as WebClient;

	private self?: SelfID;

	async authenticate(account: string) {
		if (!isSSR()) {
			try {
				const authProvider = new EthereumAuthProvider((window as any).ethereum, account);
				await this.client.authenticate(authProvider);
				this.self = new SelfID({ client: this.client });
				this.account = account;
				return true;
			} catch (err) {
				return false;
			}
		} else {
			return false;
		}
	}

	isAuthenticated() {
		return !!(this.client?.ceramic?.did?.authenticated);
	}

	async getIndexById(streamId: string) {
		
			// eslint-disable-next-line react-hooks/rules-of-hooks
			//debugger;
			const result = await composeClient.executeQuery(`{
				node(id:"${streamId}"){
				  id
				  ... on Index{
					title
					collabAction
					
				}}
			  }`);
			  console.log(result)
			return result.data.node;
		//return TileDocument.load<Indexes>(this.client!.ceramic as any, streamId);
	}
	async getIndexes(streams: { streamId: string }[]): Promise<{ [key: string]: TileDocument<Indexes> }> {
		return this.client.ceramic.multiQuery(streams) as any;
	}

	async createIndex(data: Partial<Indexes>): Promise<Indexes | null> {
		try {
			setDates(data);
			if (!data.title) {
				data.title = "Untitled Index";
			}

			if (!data.links) {
				data.links = [];
			} else {
				data.links = prepareLinks(data.links);
			}
			console.log("DOĞRU YERDE")
			
			const createIndex = await composeClient.executeQuery(`
				mutation {
				createIndex(input: {
					content: {
					title: "${data?.title}"
					collabAction: "${data?.collabAction}"
					}
				}) 
				{
					document {
					id
					title
					collabAction
					}
				}
				}
			`);
			/*const doc = await TileDocument.create<Partial<Indexes>>(this.client!.ceramic as any, data, {
				family: `index-as-${this.account || ""}`,
			});
			*/
			return null;
			//debugger;
		} catch (err) {
			return null;
		}
	}

	async addLink(streamId: string, links: Links[]): Promise<[TileDocument<Indexes>, Links[]]> {
		const oldDoc = await this.getIndexById(streamId);
		//content daha sonrasında eklenebilir for time 
		const createLink = await this.composeClient.executeQuery(`
        mutation {
          createLink(input: {
            content: {
              indexID: "${streamId}"
              indexer_did: "${links?.indexer_did}"
              url: "${links?.url}"
              title: "${links?.title}"
              tags: "${links?.tags}"
              content: "${links?.content}"
			  version: "${links?.version}"
            }
          }) 
          {
            document {
              indexID
              indexer_did
              url
              title
              tags
              content
			  version
            }
          }
        }
      `);
		return [oldDoc, links];
	}

	async putLinks(streamId: string, links: Links[]) {
		const oldDoc = await this.getIndexById(streamId);
		const { content } = oldDoc;
		const newContent: Indexes = {
			...content,
			links: links ?? [],
		};
		await oldDoc.update(newContent, undefined, {
			publish: true,
		});
		return oldDoc;
	}

	async addTag(streamId: string, linkId: string, tag: string) {
		const oldDoc = await this.getIndexById(streamId);
		const newContent = { ...oldDoc.content };
		const link = newContent.links?.find((l) => l.id === linkId);
		if (link) {
			const { tags } = link;
			if (tags && tags.includes(tag)) {
				return oldDoc;
			}
			link.tags = [...(tags ? [...tags, tag] : [tag])];
			await oldDoc.update(newContent, undefined, {
				publish: true,
			});
			return oldDoc;
		}
	}

	async removeTag(streamId: string, linkId: string, tag: string) {
		const oldDoc = await this.getIndexById(streamId);
		const newContent = { ...oldDoc.content };
		const link = newContent.links?.find((l) => l.id === linkId);
		if (link) {
			const { tags } = link;
			if (!tags) {
				return oldDoc;
			}
			link.tags = tags.filter((t) => t !== tag);
			await oldDoc.update(newContent, undefined, {
				publish: true,
			});
			return oldDoc;
		}
	}

	async setLinkFavorite(streamId: string, linkId: string, favorite: boolean) {
		const oldDoc = await this.getIndexById(streamId);
		const newContent = { ...oldDoc.content };
		const link = newContent.links?.find((l) => l.id === linkId);
		if (link) {
			link.favorite = favorite;
			await oldDoc.update(newContent, undefined, {
				publish: true,
			});
			return oldDoc;
		}
	}

	async removeLink(streamId: string, linkId: string) {
		const oldDoc = await this.getIndexById(streamId);
		const { content } = oldDoc;
		const newLinks = content?.links?.filter((li) => li.id !== linkId);
		await oldDoc.update({
			...content,
			links: newLinks,
		}, undefined, {
			publish: true,
		});
		return oldDoc;
	}

	async updateIndex(streamId: string, content: Partial<Indexes>) {
		//composea bak 
		setDates(content, true);
		const oldDoc = await this.getIndexById(streamId);
		const updateIndex = await composeClient.executeQuery(`
			mutation {
				updateIndex(input: {
				id: "${streamId}"
				content: {
					title: "${content?.title}"
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
		return null;
	}

	async getProfile(): Promise<BasicProfile | null> {
		if (this.self) {
			return this.self?.get("basicProfile");
		}
		return null;
	}

	async setProfile(profile: BasicProfile) {
		if (this.self) {
			try {
				const streamId = await this.self.set("basicProfile", profile);
				return !!(streamId);
			} catch (err) {
				return false;
			}
		}
		return false;
	}

	async uploadImage(file: File) {
		if (this.self) {
			try {
				const { cid, path } = await this.ipfs.add(file);
				return { cid, path };
			} catch (err) {
				//
			}
		}
	}

	async syncContents(providedContent?: LinkContentResult): Promise<number | null> {
		try {
			const contents = providedContent ? [providedContent] : (await api.findLinkContent());

			if (contents && contents.length > 0) {
				const docs = await this.getIndexes(contents.map((c) => ({ streamId: c.streamId })));
				if (docs) {
					Object.keys(docs).forEach((sId) => {
						const newContent = contents.find((c) => c.streamId === sId);
						const tileDoc = docs[sId];
						if (newContent) {
							const { content } = tileDoc;
							if (content.links) {
								let contentChange = false;
								newContent.links?.forEach((l, i) => {
									const oldLink = content.links.find((nl) => nl.id === l.id!);
									if (oldLink) {
										content.links[i].content = l.content;
										contentChange = true;
									}
								});

								if (contentChange) {
									tileDoc.update(content, undefined, {
										publish: true,
									});
								}
							}
						}
					});
					const ids = contents.filter((x) => !!x.id).map((x) => x.id!);
					const syncResult = await api.completeSync(ids);
					return syncResult && syncResult.deletedCount;
				}
			}
			return null;
		} catch (err) {
			return null;
		}
	}

	async close() {
		if (this.isAuthenticated()) {
			this.client!.ceramic.setDID(new DID());
			return this.client.ceramic.close();
		}
	}
}

const ceramicService2 = new CeramicService2();

export default ceramicService2;
