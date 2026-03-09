from fastapi import HTTPException
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
import os
from typing import List


def init_cloudinary():
    """
    initialize cloudinary
    """

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True
    )

    print("Cloudinary Initialized")


async def upload_image(file: UploadFile, folder: str = "providers") -> str:
    """
    uploads an image to cloudinary
    :param file: upload file from fastapi
    :param folder: cloudinary folder name (default: "providers")
    :return: str: public URL of uploaded image
    """
    try:
        content = await file.read()

        result = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type="image",
            transformation=[
                {"width": 1000, "height": 1000, "crop": "limit"},
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )

        return result['secure_url']

    except Exception as e:
        print(f"error uploading to cloudinary: {e}")
        raise HTTPException(status_code=400, detail="Could not upload the file")


async def upload_multiple_images(files: List[UploadFile], folder: str = "providers/portfolio") -> List[str]:
    """
    Upload multiple images to Cloudinary

    Args:
        files: List of UploadFile from FastAPI
        folder: Cloudinary folder name

    Returns:
        List[str]: List of public URLs
    """
    urls = []
    for file in files:
        url = await upload_image(file, folder)
        urls.append(url)

    return urls


def delete_image(image_url: str) -> bool:
    """
    delete an image frfom cloudinary
    :param image_url: full URL of image
    :return: success status
    """

    try:
        # extract public_id from url
        # URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.jpg
        parts = image_url.split("/")
        public_id_with_ext = "/".join(parts[7:]) # everything after 'upload/
        public_id = public_id_with_ext.rsplit(".", 1)[0]

        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'

    except Exception as e:
        print(f"An error occurred when deleting the file: {e}")
        raise HTTPException(status_code=400, detail="File deletion error occurred")

