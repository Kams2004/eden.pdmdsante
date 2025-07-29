import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Actuality {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  link: string;
  visible: boolean;
}

const DoctorSettings: React.FC = () => {
  const [actualities, setActualities] = useState<Actuality[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActuality, setEditingActuality] = useState<Actuality | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actualityToDelete, setActualityToDelete] = useState<Actuality | null>(null);

  const itemsPerPage = 6; // Display 6 items per page
  const totalPages = Math.ceil(actualities.length / itemsPerPage);

  useEffect(() => {
    const fetchActualities = async () => {
      try {
        const response = await axios.get('https://site.pdmdsante.com/blog/');
        const fetchedActualities = response.data.map((item: any) => ({
          id: item.id,
          title: item.titre,
          date: item.date,
          description: item.description,
          image: item.image_url,
          link: item.url,
          visible: item.is_visible,
        }));
        setActualities(fetchedActualities);
      } catch (error) {
        console.error('Error fetching actualities:', error);
      }
    };

    fetchActualities();
  }, []);

const handleAddOrEdit = async (actuality: Partial<Actuality>) => {
  const formData = new FormData();

  // Ensure that each value is defined before appending
  formData.append('titre', actuality.title || '');
  formData.append('description', actuality.description || '');
  formData.append('date', actuality.date || '');
  formData.append('url', actuality.link || '');
  formData.append('is_visible', (actuality.visible ?? true).toString());

  // Handle the image separately if it's a file input
  if (actuality.image) {
    formData.append('image', actuality.image);
  }

  try {
    await axios.post('https://site.pdmdsante.com/blog/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Refresh actualities after adding/editing
    const response = await axios.get('https://site.pdmdsante.com/blog/');
    const fetchedActualities = response.data.map((item: any) => ({
      id: item.id,
      title: item.titre,
      date: item.date,
      description: item.description,
      image: item.image_url,
      link: item.url,
      visible: item.is_visible,
    }));

    setActualities(fetchedActualities);
    setShowModal(false);
    setEditingActuality(null);
  } catch (error) {
    console.error('Error adding/editing actuality:', error);
  }
};


  const handleToggleVisibility = (id: number) => {
    setActualities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a))
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://site.pdmdsante.com/blog/del/${id}`);
      setActualities((prev) => prev.filter((a) => a.id !== id));
      setDeleteModal(false);
      setActualityToDelete(null);
      // Refresh actualities after deletion
      const response = await axios.get('https://site.pdmdsante.com/blog/');
      const fetchedActualities = response.data.map((item: any) => ({
        id: item.id,
        title: item.titre,
        date: item.date,
        description: item.description,
        image: item.image_url,
        link: item.url,
        visible: item.is_visible,
      }));
      setActualities(fetchedActualities);
    } catch (error) {
      console.error('Error deleting actuality:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentItems = actualities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Settings</h1>
        <button
          onClick={() => {
            setEditingActuality(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Actuality
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((actuality) => (
          <div key={actuality.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <img
              src={actuality.image}
              alt={actuality.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold">{actuality.title}</h3>
            <p className="text-sm text-gray-600">{actuality.date}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{actuality.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <a
                href={actuality.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                View More
              </a>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingActuality(actuality);
                    setShowModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleVisibility(actuality.id)}
                  className={`${
                    actuality.visible ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {actuality.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setActualityToDelete(actuality);
                    setDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Modal for Adding/Editing Actualities */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingActuality ? 'Edit Actuality' : 'Add New Actuality'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddOrEdit({
                  title: formData.get('title') as string,
                  date: formData.get('date') as string,
                  description: formData.get('description') as string,
                  image: formData.get('image') as string,
                  link: formData.get('link') as string,
                  visible: editingActuality ? editingActuality.visible : true,
                });
              }}
            >
              <div className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  defaultValue={editingActuality?.title || ''}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="date"
                  defaultValue={editingActuality?.date || ''}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  defaultValue={editingActuality?.description || ''}
                  rows={3}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                ></textarea>
                <input
                  type="url"
                  name="image"
                  placeholder="Image URL"
                  defaultValue={editingActuality?.image || ''}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                />
                <input
                  type="url"
                  name="link"
                  placeholder="Link URL"
                  defaultValue={editingActuality?.link || ''}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Deleting Actuality */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Delete Actuality</h2>
            <p className="mb-4">Are you sure you want to delete this actuality?</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => actualityToDelete && handleDelete(actualityToDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSettings;
