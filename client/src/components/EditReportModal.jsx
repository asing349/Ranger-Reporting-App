import { useState } from "react";

const EditReportModal = ({ report, onClose, onUpdate, onMarkResolved }) => {
  const [notes, setNotes] = useState(report.notes || "");
  const [condition, setCondition] = useState(report.condition || "Good");
  const [imageFile, setImageFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    await onUpdate({
      ...report,
      notes,
      condition,
      imageFile, // Pass the file object
    });
    setIsUpdating(false);
    onClose();
  };

  const handleMarkResolved = async () => {
    setIsUpdating(true);
    await onMarkResolved(report);
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Edit Report</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>Good</option>
              <option>Moderate</option>
              <option>Bad</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes / Description
            </label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Replace Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUpdating ? "Updating..." : "Update Report"}
            </button>
            <button
              type="button"
              onClick={handleMarkResolved}
              disabled={isUpdating}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {isUpdating ? "Updating..." : "Mark as Resolved"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="w-full bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReportModal;