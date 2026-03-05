from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from bson import ObjectId
from fastapi import UploadFile
import os


gridfs_bucket = None

def init_gridfs(database):
    """
    initialize GriFS bucket with mongodb
    call this in main.py after mongodb connection
    """
    global gridfs_bucket
    gridfs_bucket = AsyncIOMotorGridFSBucket(database)
    print("GridFS Initialization")


async def upload_document(file: UploadFile, metadata: dict = None) -> str:
    """
    upload a document to gridfs
    arguments:
        file: uploadfile from fastapi
        metadata: optional metadata dict

    :return:
        file_id: string id of uploaded file
    """

    if gridfs_bucket is None:
        raise Exception("GridFS not initialized")

    content = await file.read()

    file_id = await gridfs_bucket.upload_from_stream(
        file.filename,
        content,
        metadata=metadata or {}
    )

    return str(file_id)


async def download_document(file_id: str) -> bytes:
    """"
    download a document from gridfs

    :arg:
        file_if: string id of file

    :return:
        bytes: file content
    """
    if gridfs_bucket is None:
        raise Exception("GridFS not initialized")

    object_id = ObjectId(file_id)

    # Download from GridFS
    grid_out = await gridfs_bucket.open_download_stream(object_id)
    content = await grid_out.read()

    return content


async def delete_document(file_id: str) -> bool:
    """
    delete a document from  gridfs
    args:
        file_id: string id of file

    returns:
        bool: success status
    """

    if gridfs_bucket is None:
        raise Exception("GridFS not initialized")

    try:
        object_id = ObjectId(file_id)
        await gridfs_bucket.delete(object_id)
        return True
    except Exception as e:
        print(f"Error deleting file {file_id}: {e}")
        return False


async def get_document_metadata(file_id: str) -> dict:
    """
    Get metadata of a GridFS document

    Args:
        file_id: String ID of file

    Returns:
        dict: File metadata (filename, uploadDate, length, etc.)
    """
    if gridfs_bucket is None:
        raise Exception("GridFS not initialized")

    object_id = ObjectId(file_id)

    # Find file metadata
    file_doc = await gridfs_bucket._files.find_one({"_id": object_id})

    if file_doc:
        return {
            "filename": file_doc.get("filename"),
            "length": file_doc.get("length"),
            "uploadDate": file_doc.get("uploadDate"),
            "metadata": file_doc.get("metadata", {})
        }

    return None

