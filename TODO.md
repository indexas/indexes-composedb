### Constraints
- We'll use different lit action (ipfs_cid) for each index.
- Lit actions will contain the access control conditions array.
- Login requests will be failed if action runner is not represented in the conditions array.
- Ceramic sign: {
  Sign jwe for auth
  Sign cid for create
}
- if(!data.prev){
  //Genesis commit
}

- Mock models:
index_42: {
    controller_did: pkp_public_key
    collab_action: ipfs_id
}

link: {
    controller_did: pkp_public_key
}

ipfs_id: {
    collab_list:  []
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


index_42 : {
	
}

index
index_links index_id, indexed_at, encrypted(link_id) , encrypted(indexer_did)
link

decryptor = {
	user.auth_sig // user signature at risk, indexes are safe.
	app.auth_sig // indexes at risk, user is anonymous.
}


index.create (pkp owner) 
index.update (pkp owner)
link.create (pkp owner, collaborator)
link.update (pkp owner, link owner)
link.remove (pkp owner)


//Index create
isPkpOwner(authSign.address){

}

isColaborator(authSign.address){

}

