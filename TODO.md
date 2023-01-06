### Constraints
- We'll use different lit action (ipfs_cid) for each index.
- Lit actions will contain the access control conditions array.
- Login requests will be failed if action runner is not represented in the conditions array.
- Ceramic sign: {
  Sign jwe for auth
  Sign cid for create
}

onIndexCreate flow : {
- Mint pkp for each index. pkp is the owner of index.
- Create new lit action and give permission to this, for each index.
}

litactions.require {
    1 - mint
    2 - create action
    3 - PKP to grant permission
    4 - Revoke permitted action
    5 - is authorised PKP controller? (isowner ) isPermittedAddress / getPermittedAddresses
}

onCollabUpdate flow: {
    build collab list
    merge with collab code
    upload to ipfs
    revoke access old ipfs_id
    grant access new ipfs id
}


### Source code
- https://github.com/LIT-Protocol/LitNodeContracts/blob/94eae6c7ea630cc40f588b60023aebed58a98225/test/PKPHelper.js
- https://github.com/LIT-Protocol/lit-explorer/blob/07956edfcbd84ac1773cdd342babcbe9aa3ba894/utils/blockchain/contracts/RouterContract.ts
- https://github.com/LIT-Protocol/LitNodeContracts/blob/94eae6c7ea630cc40f588b60023aebed58a98225/test/PKPPermissions.js
- https://actions-docs.litprotocol.com/#ispermittedaction

### Helpers
- const pubkeyHash = ethers.utils.keccak256(fakePubkey);
- tokenId = ethers.BigNumber.from(pubkeyHash);


index
index_links index_id, indexed_at, encrypted(link_id) , encrypted(indexer_did)
link


Index{
    id: StreamID
    title: String! @string(maxLength:100) //Maxlength artiralim.
    controller_did : createDidfrom(pkpPublicKey)
    
    createdAt: (Ceramic'te var zaten)
    updatedAt: (Ceramic'te var zaten)

    version: CommitID! @documentVersion
    linksCount: Int! @relationCountFrom(model: "Link", property: "indexID")

    collab_action: ipfs_id
}

type Link @createModel(accountRelation: LIST, description: "A Simple Link"){
    indexID: StreamID! @documentReference(model: "Index")
    index: Index! @relationDocument(property: "indexID")
    controller_did: createDidfrom(pkpPublicKey)
    indexer_did: did(pkh, user.wallet_id: 0x1b9Aceb609a62bae0c0a9682A9268138Faff4F5f) /Baktim
    #did:pkh:eip155:1:0x1b9aceb609a62bae0c0a9682a9268138faff4f5f

    url: String! @string(maxLength:5000)
    title: String! @string(maxLength:5000)
    tags: String! @string(maxLength: 500) #Bu array olabiliyor mu?
    content: String! @string(maxLength:50000)

    createdAt: (Ceramic'te var zaten)
    updatedAt: (Ceramic'te var zaten)
    version: CommitID! @documentVersion
}

const litAction = () => {

    let index_id = 42; //Sanki her index icin yeni bir aksiyon yaratmasini saglamaliyiz gibi. Bunu zorlayalim 
    let collaborators_data = []


    
    if(data.model == 'index'){
        if(data.prev){
            op = "update"
        }else{
            op = "create"
        }

        if(!isPermittedAddress(tokenId, address)){
            error("Only permitted addresses can create or update an index with a pkp")
        }else{
            sign()
        }
    }
    if(data.model == 'link'){
        
        //Su an bu kontrolu yapamiyoruz. Frontend'de yapalim cok kritik degil.
        if(data.removed_at){
            error("Link is already deleted!"")
        }

        if(data.prev){
            op = "update"
        }else if(data.removed_at){
            op = "remove"
        }else{
            op = "create"
        }

        let isCollaborator = await Lit.Actions.checkConditions({collaborators_data, authSig, chain})
        if(pkp.isPermitted(address)){
            sign() 
        }
        else if(isCollaborator){

            sign()

            /*
            Seref indexer_didi cozdugunde yapicaz.
            if(op == "create"){
                sign()
            }else if (op == "remove" || op == "update"){
                if(data.indexer_did == address) {
                    sign()
                }
            }
            */
        }else{
            error("you do not have a permission to curate to this index")
        }
        
    }

    sign() => {
        if(data.signature == request.signature){
            sign(request.signature)
        }
    }


}

