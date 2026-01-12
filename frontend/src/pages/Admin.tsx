import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserContext";
import { useSongData } from "../context/SongContext";
import axios from "axios";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";

const server = "http://localhost:7000";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUserData();
  const { albums, songs, fetchAlbums, fetchSongs } = useSongData();

  // Album form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumFile, setAlbumFile] = useState<File | null>(null);
  const [albumFilePreview, setAlbumFilePreview] = useState<string>("");

  // Song form
  const [songTitle, setSongTitle] = useState("");
  const [songDesc, setSongDesc] = useState("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songAlbumId, setSongAlbumId] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [thumbnailFiles, setThumbnailFiles] = useState<{ [key: string]: File | null }>({});

  useEffect(() => {
    if (!userLoading && user && user.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    fetchAlbums();
    fetchSongs();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, type?: 'album') => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    
    // Create preview for album thumbnails
    if (type === 'album' && file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAlbumFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>, songId: string) => {
    setThumbnailFiles(prev => ({ ...prev, [songId]: e.target.files?.[0] || null }));
  };

  const addAlbumHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (!albumFile) return toast.error("Please select a thumbnail file");

    const formData = new FormData();
    formData.append("title", albumTitle);
    formData.append("description", albumDesc);
    formData.append("file", albumFile);

    try {
      setBtnLoading(true);
      const { data } = await axios.post(`${server}/api/v1/album/new`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      toast.success(data.message);
      await fetchAlbums();
      setAlbumTitle("");
      setAlbumDesc("");
      setAlbumFile(null);
      setAlbumFilePreview("");
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Album upload error:", error);
      toast.error(error.response?.data?.message || "Error adding album");
    } finally {
      setBtnLoading(false);
    }
  };

  const addSongHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (!songFile || !songAlbumId) return toast.error("Please fill all fields and select an audio file");

    const formData = new FormData();
    formData.append("title", songTitle);
    formData.append("description", songDesc);
    formData.append("file", songFile);
    formData.append("album", songAlbumId);

    try {
      setBtnLoading(true);
      toast.loading("Uploading song... This may take a minute.");
      const { data } = await axios.post(`${server}/api/v1/song/new`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000, // 2 minutes timeout
      });
      toast.dismiss();
      toast.success(data.message);
      await fetchSongs();
      setSongTitle("");
      setSongDesc("");
      setSongFile(null);
      setSongAlbumId("");
      // Reset file input
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input instanceof HTMLInputElement) input.value = '';
      });
    } catch (error: any) {
      toast.dismiss();
      console.error("Song upload error:", error);
      toast.error(error.response?.data?.message || "Error adding song. File may be too large.");
    } finally {
      setBtnLoading(false);
    }
  };

  const addThumbnailHandler = async (id: string) => {
    const file = thumbnailFiles[id];
    if (!file) return toast.error("Please choose a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingId(id);
      const { data } = await axios.post(`${server}/api/v1/song/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      toast.success(data.message);
      await fetchSongs();
      setThumbnailFiles(prev => ({ ...prev, [id]: null }));
    } catch (error: any) {
      console.error("Thumbnail upload error:", error);
      toast.error(error.response?.data?.message || "Error adding thumbnail");
    } finally {
      setUploadingId(null);
    }
  };

  const deleteAlbum = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this album? All songs in this album will also be deleted.")) return;
    try {
      setBtnLoading(true);
      const { data } = await axios.delete(`${server}/api/v1/album/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(data.message);
      await fetchAlbums();
      await fetchSongs();
    } catch (error: any) {
      console.error("Delete album error:", error);
      toast.error(error.response?.data?.message || "Error deleting album");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteSong = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      setBtnLoading(true);
      const { data } = await axios.delete(`${server}/api/v1/song/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(data.message);
      await fetchSongs();
    } catch (error: any) {
      console.error("Delete song error:", error);
      toast.error(error.response?.data?.message || "Error deleting song");
    } finally {
      setBtnLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#212121] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link to="/" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition">
            ← Back to Home
          </Link>
        </div>

        {/* Add Album Section */}
        <div className="bg-[#181818] p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Album</h2>
          <form onSubmit={addAlbumHandler} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Album Title" 
                className="auth-input w-full" 
                value={albumTitle} 
                onChange={(e) => setAlbumTitle(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Album Description" 
                className="auth-input w-full" 
                value={albumDesc} 
                onChange={(e) => setAlbumDesc(e.target.value)} 
                required 
              />
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept="image/*" 
                className="auth-input flex-1" 
                onChange={(e) => handleFileChange(e, setAlbumFile, 'album')} 
                required 
              />
              {albumFilePreview && (
                <img src={albumFilePreview} alt="Preview" className="w-20 h-20 rounded object-cover" />
              )}
            </div>
            <button 
              type="submit" 
              className="auth-btn w-full md:w-auto px-8" 
              disabled={btnLoading}
            >
              {btnLoading ? "Adding..." : "Add Album"}
            </button>
          </form>
        </div>

        {/* Add Song Section */}
        <div className="bg-[#181818] p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Song</h2>
          <form onSubmit={addSongHandler} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Song Title" 
                className="auth-input w-full" 
                value={songTitle} 
                onChange={(e) => setSongTitle(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Song Description" 
                className="auth-input w-full" 
                value={songDesc} 
                onChange={(e) => setSongDesc(e.target.value)} 
                required 
              />
            </div>
            <select 
              className="auth-input w-full" 
              value={songAlbumId} 
              onChange={(e) => setSongAlbumId(e.target.value)} 
              required
            >
              <option value="">Select Album</option>
              {albums?.map((album: any) => (
                <option value={album.id} key={album.id}>{album.title}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm mb-2">Audio File (MP3, WAV, etc.)</label>
              <input 
                type="file" 
                accept="audio/*" 
                className="auth-input w-full" 
                onChange={(e) => handleFileChange(e, setSongFile)} 
                required 
              />
              {songFile && (
                <p className="text-sm text-gray-400 mt-2">Selected: {songFile.name} ({(songFile.size / 1024 / 1024).toFixed(2)} MB)</p>
              )}
            </div>
            <button 
              type="submit" 
              className="auth-btn w-full md:w-auto px-8" 
              disabled={btnLoading}
            >
              {btnLoading ? "Uploading..." : "Add Song"}
            </button>
          </form>
        </div>

        {/* Albums List */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Albums ({albums?.length || 0})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums?.map((album: any) => (
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition" key={album.id}>
                <img src={album.thumbnail} className="w-full h-48 object-cover rounded mb-3" alt={album.title} />
                <h4 className="font-bold text-lg mb-1">{album.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{album.description?.slice(0, 50)}{album.description?.length > 50 ? '...' : ''}</p>
                <button 
                  className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white flex items-center justify-center gap-2 transition" 
                  disabled={btnLoading} 
                  onClick={() => deleteAlbum(album.id)}
                >
                  <MdDelete /> Delete Album
                </button>
              </div>
            ))}
          </div>
          {albums?.length === 0 && (
            <p className="text-gray-400 text-center py-8">No albums yet. Add your first album above!</p>
          )}
        </div>

        {/* Songs List */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Songs ({songs?.length || 0})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs?.map((song: any) => (
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition" key={song.id}>
                {song.thumbnail ? (
                  <img src={song.thumbnail} className="w-full h-48 object-cover rounded mb-3" alt={song.title} />
                ) : (
                  <div className="bg-[#282828] p-4 rounded mb-3 h-48 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-400 text-center mb-2">No thumbnail</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="text-xs"
                      onChange={(e) => handleThumbnailChange(e, song.id)} 
                    />
                    <button 
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm transition" 
                      disabled={uploadingId === song.id} 
                      onClick={() => addThumbnailHandler(song.id)}
                    >
                      {uploadingId === song.id ? "Uploading..." : "Add Thumbnail"}
                    </button>
                  </div>
                )}
                <h4 className="font-bold text-lg mb-1">{song.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{song.description?.slice(0, 50)}{song.description?.length > 50 ? '...' : ''}</p>
                <button 
                  className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white flex items-center justify-center gap-2 transition" 
                  disabled={btnLoading} 
                  onClick={() => deleteSong(song.id)}
                >
                  <MdDelete /> Delete Song
                </button>
              </div>
            ))}
          </div>
          {songs?.length === 0 && (
            <p className="text-gray-400 text-center py-8">No songs yet. Add your first song above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
