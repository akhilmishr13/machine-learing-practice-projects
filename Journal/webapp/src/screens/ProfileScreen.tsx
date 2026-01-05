import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from '../stores/habitStore';
import { useAuthStore } from '../stores/authStore';
import { Habit } from '../types';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { habits, loadHabits, createHabit, updateHabit, deleteHabit } =
    useHabitStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    icon: '',
    category: '',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData);
        setEditingHabit(null);
      } else {
        await createHabit(formData);
      }
      setFormData({ name: '', color: '#6366f1', icon: '', category: '' });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Failed to save habit:', error);
      alert(error.message || 'Failed to save habit. Please try again.');
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      color: habit.color,
      icon: habit.icon || '',
      category: habit.category || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this habit?')) {
      await deleteHabit(id);
    }
  };

  const colors = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-16">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {user?.full_name || user?.username || 'Manage your account'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 rounded-lg font-medium self-start sm:self-auto"
          >
            Logout
          </button>
        </div>
        {user && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 break-words">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              <span className="font-medium">Username:</span> {user.username}
            </p>
          </div>
        )}
      </div>

      {/* Habits Section */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Habits</h2>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingHabit(null);
              setFormData({ name: '', color: '#6366f1', icon: '', category: '' });
            }}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium hover:bg-primary-700 self-start sm:self-auto"
          >
            {showAddForm ? 'Cancel' : '+ Add Habit'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Morning Meditation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 touch-manipulation ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Health, Work"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:bg-primary-700 touch-manipulation"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </button>
            </div>
          </form>
        )}

        {/* Habits List */}
        <div className="space-y-2 sm:space-y-3">
          {habits.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-gray-500">No habits yet. Create your first habit!</p>
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{habit.name}</p>
                    {habit.category && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{habit.category}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          habit.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {habit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:space-x-2 sm:flex-nowrap">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="text-primary-600 hover:text-primary-700 px-2 sm:px-3 py-1 text-xs sm:text-sm touch-manipulation"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      updateHabit(habit.id, { isActive: !habit.isActive })
                    }
                    className="text-gray-600 hover:text-gray-700 px-2 sm:px-3 py-1 text-xs sm:text-sm touch-manipulation"
                  >
                    {habit.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="text-red-600 hover:text-red-700 px-2 sm:px-3 py-1 text-xs sm:text-sm touch-manipulation"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

