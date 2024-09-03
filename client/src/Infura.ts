import { create } from "kubo-rpc-client";
import { Buffer } from "buffer";

const projectId = "2IHRvFT45OgwWLAxh9VskodxGOh";
const projectSecret = "8b6ad7e4fb03a670df238c036b0c5035";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: any) => {
  console.log("uploading single file .....");
  const subdomain = "https://hambre.infura-ipfs.io";
  try {
    const added = await client.add(file);
    const URL = `${subdomain}/ipfs/${added.path}`;
    console.log("uploaded", URL);
    return URL;
  } catch (error) {
    console.log("Error uploading file to IPFS:", error);
  }
};

export const uploadMultipleToIPFS = async (files: any[]) => {
  console.log("Uploading multiple files to IPFS...");

  const uploadPromises = files.map(async (file) => {
    try {
      const added = await client.add(file.content);
      const url = `https://hambre.infura-ipfs.io/ipfs/${added.path}`;
      console.log("Uploaded:", file.name, url);
      return { filename: file.name, url };
    } catch (error) {
      console.error("Error uploading file to IPFS:", file.name, error);
      return null;
    }
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results.filter((result) => result !== null); // Filter out failed uploads
  } catch (error) {
    console.error("Error processing uploads to IPFS:", error);
    return [];
  }
};
