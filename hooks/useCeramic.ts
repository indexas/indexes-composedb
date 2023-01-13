import { CeramicContext } from "../context/CeramicProvider";
import { useContext } from "react";

export function useCeramic() {
	const context = useContext(CeramicContext);

	return context;
}
