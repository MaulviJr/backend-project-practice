import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { application } from "express"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!(name || description)) {
        throw new ApiError(400, "The name and description are required")
    }

    const playlistCreated = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })

    if (!playlistCreated) {
        throw new ApiError(400, "Playlist couldn't be created")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                playlistCreated,
                "Playlist has been created"
            )
        )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!(isValidObjectId(userId))) {
        throw new ApiError(404, "the userId is InValid")
    }

    const userPlaylists = await Playlist.find(
        {
            owner: userId
        }
    )

    if (userPlaylists.length === 0) {
        throw new ApiError(404, "User doesn't has a playlist")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylists,
                "The User playlists has been fetched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "the PlaylistId is InValid")
    }

    const playlistById = await Playlist.findById(playlistId);

    if (!playlistById) {
        throw new ApiError(400, "Playlist not found");
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                playlistById,
                "The Playlist has been fetched successfully"
            )
        )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "the PlaylistId is InValid")
    }

    // 1. Fetch the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 2. Check ownership (Secured)
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this playlist");
    }

    // 3. Check if video already exists in the playlist to prevent duplicates
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is already in the playlist");
    }

    // 4. Update the array and save
    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "the PlaylistId is InValid")
    }
   

    const deletePlaylist = await Playlist.findById(playlistId);



    deletePlaylist.videos = deletePlaylist.videos.filter((video) => (video.toString() !== videoId.toString()))

   await deletePlaylist.save()

      return res.status(200).json(
        new ApiResponse(200,
             {removedVideo: videoId}, "Video removed to playlist successfully")
    );



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "the PlaylistId is InValid")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist ) {
        throw new ApiError(400,"The playlist deleted successfully")
    }

       return res.status(200).json(
        new ApiResponse(200,
             deletedPlaylist, "Video removed to playlist successfully")
    );

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

     if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "the PlaylistId is InValid")
    }

     if (!(name || description)) {
        throw new ApiError(400, "The name and description are required")
    }

    const updatePlaylist = await Playlist.findById(playlistId);

    if(!updatePlaylist) {
        throw new ApiError(400,"coudln't find playlist");
    }

    updatePlaylist.name = name;
    updatePlaylist.description = description;

    await updatePlaylist.save();

         return res.status(200).json(
        new ApiResponse(200,
             updatePlaylist, "Playlist Updated Successfully")
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}