import React, { useState } from 'react';
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
  const [actualities, setActualities] = useState<Actuality[]>([
    {
      id: 6,
      title: "Grande compagne de prise en charge des lombalgies et des Cervicalgies",
      date: "Du 12 au 18 Juin 2023",
      description:
        "Grande campagne de prise en charge des Lombalgies (mal de dos) des cervicalgies, des patients souffrants de hernie discale (sciatalgie-sciatique/cervicobrachialgie)…Avec une réduction de 30% sur les tarifs régulièrement appliqués.",
      image:
        "https://pdmdsante.com/wp-content/uploads/2023/06/349642424_949889916054279_1739287961669853403_n-763x675.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/grande-compagne-de-prise-en-charge-des-lombalgies-et-des-cervicalgies/",
      visible: true,
    },
    // Add more demo actualities here for testing pagination
    { id: 7,
        title: "Grande compagne de prise en charge des lombalgies et des Cervicalgies",
        date: "Du 12 au 18 Juin 2023",
        description: "Grande campagne de prise en charge des Lombalgies (mal de dos) des cervicalgies, des patients souffrants de hernie discale (sciatalgie-sciatique/cervicobrachialgie)…Avec une réduction de 30% sur les tarifs régulièrement appliqués.",
        image: "https://pdmdsante.com/wp-content/uploads/2023/06/349642424_949889916054279_1739287961669853403_n-763x675.jpg?w=500&auto=format",
        link: "https://pdmdsante.com/grande-compagne-de-prise-en-charge-des-lombalgies-et-des-cervicalgies/",
        visible:true
      },
    { id: 8,   
        title: "Octobre rose 2023",
        date: "Oct 2, 2023",
        description: "Pediatric wing renovation completed with improved facilities.",
        image: "https://pdmdsante.com/wp-content/uploads/2024/08/Octobre-rose-2023-version-francaise-1080x675.jpg?w=500&auto=format",
        link: "https://pdmdsante.com/octobre-rose-2022/",
         visible: true },
    { id: 9, title: "Example Title 3", date: "2024-01-03", description: "Description 3", image: "", link: "", visible: true },
    { id: 10, title: "Example Title 4", date: "2024-01-04", description: "Description 4", image: "", link: "", visible: true },
    { id: 11, title: "Example Title 5", date: "2024-01-05", description: "Description 5", image: "", link: "", visible: true },
    { id: 12, title: "Example Title 6", date: "2024-01-06", description: "Description 6", image: "", link: "", visible: true },
    { id: 13, title: "Example Title 7", date: "2024-01-07", description: "Description 7", image: "", link: "", visible: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingActuality, setEditingActuality] = useState<Actuality | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6; // Display 6 items per page
  const totalPages = Math.ceil(actualities.length / itemsPerPage);

  const handleAddOrEdit = (actuality: Partial<Actuality>) => {
    if (editingActuality) {
      setActualities((prev) =>
        prev.map((a) => (a.id === editingActuality.id ? { ...a, ...actuality } : a))
      );
    } else { 
      setActualities((prev) => [
        ...prev,
        { ...actuality, id: prev.length + 1, visible: true } as Actuality,
      ]);
    }
    setShowModal(false);
    setEditingActuality(null);
  };

  const handleToggleVisibility = (id: number) => {
    setActualities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a))
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this actuality?')) {
      setActualities((prev) => prev.filter((a) => a.id !== id));
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
                  onClick={() => setEditingActuality(actuality) || setShowModal(true)}
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
                  onClick={() => handleDelete(actuality.id)}
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
    </div>
  );
};

export default DoctorSettings;
