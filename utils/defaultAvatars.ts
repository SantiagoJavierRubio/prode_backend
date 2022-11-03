import { default as _cloudinary,  ResourceApiResponse } from "cloudinary";
import config from "../config";

_cloudinary.v2.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
  secure: true,
});

class Cloudinary {
  private async _getResources(): Promise<ResourceApiResponse> {
    return await _cloudinary.v2.api.resources(
      {
        type: "upload",
        prefix: "avatars",
        max_results: 100,
      },
      (err, result) => {
        if (err) throw new Error(err);
        else return result;
      }
    );
  }
  private _transformUrl(url: string): string {
    const formatIndex = url.lastIndexOf(".");
    const formatedUrl = url.slice(0, formatIndex) + ".png";
    return formatedUrl.replace(
      /upload\/\w+\//,
      "upload/c_thumb,h_200,w_200,r_max/"
    );
  }
  async getAvatars(): Promise<string[]> {
    const resources = await this._getResources();
    return resources?.resources.map((resource) => {
        return this._transformUrl(resource.url)
    })
  }
}

export const cloudinary = new Cloudinary();
