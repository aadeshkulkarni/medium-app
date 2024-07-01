import axios from "axios";
import { atomFamily, selectorFamily } from "recoil";
import { BACKEND_URL } from "../../config";

export const blogAtom = atomFamily({
    key:"blog",
    default:selectorFamily({
        key:"blogSelector",
        get:(id)=>async()=>{
            const res = await axios.get(`${BACKEND_URL}/api/v1/blog/${String(id)}`,{
                headers:{
                    "Authorization":`Bearer ${localStorage.getItem("token")}`
                }
            });
            return res.data.post
        }
    })
})