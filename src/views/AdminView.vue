<template>
    <div class="admin-container">
        <h1>Admin Dashboard</h1>

        <div class="quiz-management">
            <div v-if="loading" class="loading">Loading quiz data...</div>
            <div v-else-if="quizzes.length === 0" class="no-data">
                No quiz histories found.
            </div>
            <div v-else class="quiz-list">
                <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-item" @click="openQuizDetails(quiz.id)">
                    <div class="quiz-header">
                        <h3>{{ getQuizTitle(quiz) }}</h3>
                        <!-- <span class="quiz-date">{{ formatDate(quiz.created_at) }}</span> -->
                    </div>
                    <div class="quiz-info">
                        <p>Participants: {{ quiz.participants_count }}</p>
                        <p>Quiz ID: {{ quiz.id }}</p>
                        <p>{{ formatDate(quiz.created_at) }}</p>
                    </div>
                    <div class="quiz-actions">
                        <button @click.stop="editQuiz(quiz)" class="action-btn edit">
                            Edit
                        </button>
                        <button @click.stop="deleteQuiz(quiz.id)" class="action-btn delete">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Quiz Stats Modal -->
        <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal-content" @click.stop>
                <!-- Modal Header -->
                <div class="modal-header">
                    <h2>Quiz Details</h2>
                    <button class="modal-close-btn" @click="closeDetailsModal">×</button>
                </div>

                <!-- Modal Body with organized sections -->
                <div class="modal-body">
                    <!-- General Information Section -->
                    <section class="general-info">
                        <h3>General Information</h3>
                        <div class="info-row">
                            <span class="info-label">Quiz ID:</span>
                            <span class="info-value">{{ selectedQuiz.id }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date:</span>
                            <span class="info-value">{{ formatDate(selectedQuiz.created_at) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Participants:</span>
                            <span class="info-value">{{ selectedQuiz.participants_count }}</span>
                        </div>
                    </section>

                    <!-- Statistics Section -->
                    <section class="statistics">
                        <h3>Statistics</h3>
                        <div class="info-row">
                            <span class="info-label">Attempts:</span>
                            <span class="info-value">{{ selectedQuiz.stats.attempts }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Win Ratio:</span>
                            <span class="info-value">{{ selectedQuiz.stats.winRatio }}%</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Loss Ratio:</span>
                            <span class="info-value">{{ selectedQuiz.stats.lossRatio }}%</span>
                        </div>
                    </section>

                    <!-- Optional Chart Section (uncomment when needed)
                    <section class="chart-section">
                      <h3>Win/Loss Chart</h3>
                      <div class="chart-container">
                        <BarChart :chartData="chartData" :chartOptions="chartOptions" />
                      </div>
                    </section>
                    -->
                </div>

                <!-- Modal Footer -->
                <div class="modal-footer">
                    <button class="close-btn" @click="closeDetailsModal">Close</button>
                </div>
            </div>
        </div>

        <!-- Edit Quiz Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
            <div class="modal-content" @click.stop>
                <!-- Modal Header -->
                <div class="modal-header">
                    <h2>Edit Quiz</h2>
                    <button class="modal-close-btn" @click="closeEditModal">×</button>
                </div>

                <!-- Modal Body with edit form -->
                <div class="modal-body">
                    <form @submit.prevent="saveQuizChanges" class="edit-form">
                        <!-- Read-only Information Section -->
                        <div class="form-section">
                            <h3>Quiz Information</h3>
                            <div class="info-row">
                                <span class="info-label">Quiz ID:</span>
                                <span class="info-value">{{ editQuizData.id }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Created Date:</span>
                                <span class="info-value">{{ formatDate(editQuizData.created_at) }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Participants Count:</span>
                                <span class="info-value">{{ editQuizData.participants_count }}</span>
                            </div>
                        </div>

                        <!-- Quiz Basic Settings Section -->
                        <div class="form-section">
                            <h3>Quiz Details</h3>

                            <!-- Quiz Title -->
                            <div class="form-group">
                                <label for="quiz_title">Quiz Title:</label>
                                <input type="text" id="quiz_title" v-model="editableQuizData.quiz_title"
                                    class="form-control">
                            </div>

                            <!-- Quiz Description -->
                            <div class="form-group">
                                <label for="quiz_description">Quiz Hint:</label>
                                <textarea id="quiz_description" v-model="editableQuizData.quiz_description"
                                    class="form-control" rows="2"></textarea>
                            </div>

                            <!-- Quiz Difficulty -->
                            <div class="form-group">
                                <label for="quiz_difficulty">Difficulty Level:</label>
                                <select id="quiz_difficulty" v-model="editableQuizData.quiz_difficulty"
                                    class="form-control">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <!-- Quiz Duration (optional)
                            <div class="form-group">
                                <label for="quiz_duration">Duration (minutes, optional):</label>
                                <input type="number" id="quiz_duration" v-model="editableQuizData.quiz_duration"
                                    class="form-control" min="1">
                            </div> -->

                            <!-- Quiz Question -->
                            <div class="form-group">
                                <label for="quiz_question">Main Question:</label>
                                <textarea id="quiz_question" v-model="editableQuizData.quiz_question"
                                    class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                        <!-- Answer Keywords Section -->
                        <div class="form-section">
                            <h3>Answer Keywords <span class="keyword-counter">({{ editableQuizData.answer_keywords ?
                                editableQuizData.answer_keywords.length : 0 }})</span></h3>
                            <p class="keywords-description">Add keywords that will be used to check if the user's answer
                                is correct. Users typing any of these keywords will be marked correct.</p>

                            <div class="keywords-wrapper">
                                <div v-if="!editableQuizData.answer_keywords || editableQuizData.answer_keywords.length === 0"
                                    class="no-items-message">
                                    No keywords added yet.
                                </div>
                                <div v-for="(keyword, index) in editableQuizData.answer_keywords" :key="index"
                                    class="keyword-group">
                                    <button v-if="editableQuizData.answer_keywords.length > 1" type="button"
                                        class="remove-keyword-btn" @click="removeKeyword(index)" title="Remove Keyword">
                                        ×
                                    </button>
                                    <div class="form-group">
                                        <input type="text" v-model="editableQuizData.answer_keywords[index]"
                                            placeholder="Enter answer keyword" class="keyword-input form-control"
                                            required />
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="add-btn" @click="addKeyword">
                                + Add Keyword
                            </button>
                        </div>
                        <!-- Clues Section -->
                        <div class="form-section">
                            <h3>Clues</h3>
                            <div v-if="editableQuizData.clues.length === 0" class="no-items-message">
                                No clues added yet.
                            </div>
                            <div v-for="(clue, index) in editableQuizData.clues" :key="index" class="item-card">
                                <div class="item-header">
                                    <h4>Clue {{ index + 1 }}</h4>
                                    <button type="button" @click="removeClue(index)" class="remove-btn">
                                        Remove
                                    </button>
                                </div>

                                <!-- Clue Title -->
                                <div class="form-group">
                                    <label :for="`clue_title_${index}`">Title:</label>
                                    <input :id="`clue_title_${index}`" v-model="clue.title" class="form-control">
                                </div>

                                <!-- Clue Text -->
                                <div class="form-group">
                                    <label :for="`clue_text_${index}`">Text:</label>
                                    <textarea :id="`clue_text_${index}`" v-model="clue.text" class="form-control"
                                        rows="3"></textarea>
                                </div>
                            </div>

                            <button type="button" @click="addClue" class="add-btn">
                                Add Clue
                            </button>
                        </div>

                        <!-- Quiz Answer Section -->
                        <div class="form-section">
                            <h3>Quiz Answer</h3>

                            <!-- Answer Name -->
                            <div class="form-group">
                                <label for="answer_name">Name:</label>
                                <input id="answer_name" v-model="editableQuizData.quiz_answer.name"
                                    class="form-control">
                            </div>

                            <!-- Answer Timeline -->
                            <div class="form-group">
                                <label for="answer_timeline">Timeline:</label>
                                <input id="answer_timeline" v-model="editableQuizData.quiz_answer.timeline"
                                    class="form-control">
                            </div>

                            <!-- Answer Description -->
                            <div class="form-group">
                                <label for="answer_description">Description:</label>
                                <textarea id="answer_description" v-model="editableQuizData.quiz_answer.description"
                                    class="form-control" rows="4"></textarea>
                            </div>

                            <!-- Result Photo Upload -->
                            <!-- Result Photo Upload -->
                            <div class="form-group file-upload-group">
                                <label for="result_photo">Result Photo:</label>
                                <div class="file-upload-container">
                                    <input type="file" id="result_photo" ref="resultPhotoInput"
                                        @change="handleFileChange" class="file-input" accept="image/*">
                                    <div class="file-upload-ui">
                                        <div class="file-upload-preview" v-if="imagePreview || currentPhotoUrl">
                                            <img :src="imagePreview || currentPhotoUrl" alt="Result preview"
                                                class="preview-image">
                                            <button type="button" @click="removeImage" class="remove-image-btn"
                                                aria-label="Remove image">
                                                <span class="remove-icon">×</span>
                                            </button>
                                        </div>
                                        <div class="file-upload-controls" v-if="!imagePreview && !currentPhotoUrl">
                                            <div class="upload-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7">
                                                    </path>
                                                    <line x1="16" y1="5" x2="22" y2="5"></line>
                                                    <line x1="19" y1="2" x2="19" y2="8"></line>
                                                    <circle cx="9" cy="9" r="2"></circle>
                                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                                </svg>
                                            </div>
                                            <span class="upload-text">Click on browse to upload an image</span>
                                            <button type="button" class="browse-btn" @click="triggerFileInput">Browse
                                                files</button>
                                        </div>
                                        <div class="file-info" v-if="selectedFile && !imagePreview">
                                            <span>{{ selectedFile.name }}</span>
                                            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Answer Sections -->
                            <div class="subsection">
                                <h4>Sections</h4>
                                <div v-if="editableQuizData.quiz_answer.sections.length === 0" class="no-items-message">
                                    No sections added yet.
                                </div>
                                <div v-for="(section, sIndex) in editableQuizData.quiz_answer.sections" :key="sIndex"
                                    class="item-card">
                                    <div class="item-header">
                                        <h4>Section {{ sIndex + 1 }}</h4>
                                        <button type="button" @click="removeSection(sIndex)" class="remove-btn">
                                            Remove
                                        </button>
                                    </div>

                                    <!-- Section Title -->
                                    <div class="form-group">
                                        <label :for="`section_title_${sIndex}`">Title:</label>
                                        <input :id="`section_title_${sIndex}`" v-model="section.title"
                                            class="form-control">
                                    </div>

                                    <!-- Section Input Type -->
                                    <div class="form-group">
                                        <label :for="`section_input_type_${sIndex}`">Input Type:</label>
                                        <select :id="`section_input_type_${sIndex}`" v-model="section.inputType"
                                            class="form-control">
                                            <option value="bullet">Bullet Points</option>
                                            <option value="paragraph">Description</option>
                                        </select>
                                    </div>

                                    <!-- Section Description -->
                                    <div class="form-group" v-if="section.inputType !== 'bullet'">
                                        <label :for="`section_description_${sIndex}`">Description:</label>
                                        <textarea :id="`section_description_${sIndex}`" v-model="section.description"
                                            class="form-control" rows="2"></textarea>
                                    </div>

                                    <!-- Bullet Points (if input type is bullet) -->
                                    <div v-if="section.inputType === 'bullet'" class="bullet-points-container">
                                        <label>Bullet Points:</label>
                                        <div v-for="(point, pIndex) in section.bulletPoints" :key="pIndex"
                                            class="bullet-point-row">
                                            <input :id="`bullet_point_${sIndex}_${pIndex}`"
                                                v-model="section.bulletPoints[pIndex]" class="form-control"
                                                placeholder="Enter bullet point text">
                                            <button type="button" @click="removeBulletPoint(sIndex, pIndex)"
                                                class="small-remove-btn" v-if="section.bulletPoints.length > 1">
                                                ×
                                            </button>
                                        </div>
                                        <button type="button" @click="addBulletPoint(sIndex)" class="add-small-btn">
                                            Add Point
                                        </button>
                                    </div>
                                </div>

                                <button type="button" @click="addSection" class="add-btn">
                                    Add Section
                                </button>
                            </div>
                        </div>

                        <div v-if="validationError" class="validation-error">
                            {{ validationError }}
                        </div>
                    </form>
                </div>

                <!-- Modal Footer -->
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" @click="closeEditModal">Cancel</button>
                    <button type="button" class="primary-btn" @click="saveQuizChanges">Save Changes</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Create a wrapper component for BarChart
const BarChart = {
    props: {
        chartData: { type: Object, required: true },
        chartOptions: { type: Object, required: false }
    },
    extends: Bar,
    mounted() {
        this.renderChart(this.chartData, this.chartOptions)
    },
    watch: {
        chartData: {
            handler(newData) {
                this.renderChart(newData, this.chartOptions)
            },
            deep: true
        }
    }
}

// Admin authentication store
const authStore = useAuthStore()

// Reactive states for quiz data
const quizzes = ref([])
const loading = ref(true)

// For quiz details modal
const showDetailsModal = ref(false)
const selectedQuiz = ref({ id: '', created_at: '', participants_count: 0, stats: {} })

// For edit quiz modal
const showEditModal = ref(false)
const editQuizData = ref({
    id: '',
    created_at: '',
    participants_count: 0
})
// File upload related states
const selectedFile = ref(null)
const imagePreview = ref('')
const currentPhotoUrl = ref('')
const resultPhotoInput = ref(null)
// Editable quiz data structured to match the actual quiz_data format
const editableQuizData = ref({
    quiz_title: '',
    quiz_description: '',
    quiz_difficulty: 'easy',
    quiz_duration: null,
    quiz_question: '',
    answer_keywords: [],
    clues: [],
    quiz_answer: {
        name: '',
        timeline: '',
        description: '',
        photo: '',
        sections: []
    }
})

const validationError = ref('')

// Chart data and options (dummy example)
const chartData = ref({
    labels: ['Win', 'Loss'],
    datasets: [
        {
            label: 'Attempts',
            backgroundColor: ['#4caf50', '#f44336'],
            data: [0, 0]
        }
    ]
})
const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false, // Allow chart container to set dimensions
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Win/Loss Ratio' }
    }
})
// Add this function to your script section
const getQuizTitle = (quiz) => {
    if (quiz.quiz_data) {
        try {
            // Try to parse quiz_data if it's a string
            const parsedData = typeof quiz.quiz_data === 'string'
                ? JSON.parse(quiz.quiz_data)
                : quiz.quiz_data;
            return parsedData.quiz_title || 'Untitled Quiz';
        } catch (e) {
            return 'Untitled Quiz';
        }
    }
    // If quiz has a direct title property
    return quiz.title || quiz.quiz_title || 'Untitled Quiz';
}
// Fetch quizzes from the API
const fetchQuizzes = async () => {
    loading.value = true
    try {
        const response = await axios.get(
            'https://quiz.thecore.in/backend-dev/admin/quiz-history',
            { withCredentials: true }
        )
        if (response.data.status === 'success') {
            quizzes.value = response.data.data
        } else {
            console.error('Failed to fetch quiz data:', response.data.message)
        }
    } catch (error) {
        console.error('Error fetching quiz data:', error)
    } finally {
        loading.value = false
    }
}

// Function to format date string
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

// Open quiz details and configure stats/chart data
const openQuizDetails = async (id) => {
    try {
        const response = await axios.get(
            `https://quiz.thecore.in/backend-dev/admin/quiz-history/${id}`,
            { withCredentials: true }
        )

        if (response.data.status === 'success') {
            selectedQuiz.value = response.data.data

            if (selectedQuiz.value.quiz_results) {
                let quizResults
                try {
                    quizResults = typeof selectedQuiz.value.quiz_results === 'string'
                        ? JSON.parse(selectedQuiz.value.quiz_results)
                        : selectedQuiz.value.quiz_results
                } catch (parseError) {
                    console.error('Error parsing quiz_results:', parseError)
                    quizResults = {}
                }

                if (quizResults.results && Array.isArray(quizResults.results)) {
                    const attempts = quizResults.results.length
                    const wins = quizResults.results.filter(
                        (r) => r.result && r.result.toLowerCase() === 'win'
                    ).length
                    const losses = quizResults.results.filter(
                        (r) => r.result && r.result.toLowerCase() === 'loss'
                    ).length
                    const winRatio = attempts > 0 ? Math.round((wins / attempts) * 100) : 0
                    const lossRatio = attempts > 0 ? Math.round((losses / attempts) * 100) : 0
                    selectedQuiz.value.stats = { attempts, winRatio, lossRatio }
                } else {
                    selectedQuiz.value.stats = { attempts: 0, winRatio: 0, lossRatio: 0 }
                }
            } else {
                const attempts = Number(selectedQuiz.value.participants_count) || 0
                selectedQuiz.value.stats = { attempts, winRatio: 0, lossRatio: 0 }
            }

            chartData.value.datasets[0].data = [
                selectedQuiz.value.stats.winRatio,
                selectedQuiz.value.stats.lossRatio
            ]

            showDetailsModal.value = true
        } else {
            alert('Failed to fetch quiz details: ' + response.data.message)
        }
    } catch (error) {
        console.error('Error fetching quiz details:', error)
        alert('Error fetching quiz details.')
    }
}

// Close details modal
const closeDetailsModal = () => {
    showDetailsModal.value = false
}

// Delete a quiz history entry
const deleteQuiz = async (id) => {
    if (confirm('Are you sure you want to delete this quiz history?')) {
        try {
            const response = await axios.delete(
                `https://quiz.thecore.in/backend-dev/admin/quiz-history/delete/${id}`,
                { withCredentials: true }
            )
            if (response.data.status === 'success') {
                quizzes.value = quizzes.value.filter((quiz) => quiz.id !== id)
                alert('Quiz history deleted successfully')
            } else {
                alert(`Failed to delete: ${response.data.message}`)
            }
        } catch (error) {
            console.error('Error deleting quiz:', error)
            alert('Error deleting quiz history')
        }
    }
}

// Format file size to human-readable format
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Trigger file input click
const triggerFileInput = () => {
    if (resultPhotoInput.value) {
        resultPhotoInput.value.click();
    }
};

// Handle file drop
const handleFileDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];

        // Check if file is an image
        if (file.type.startsWith('image/')) {
            selectedFile.value = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.value = e.target.result;
            };
            reader.readAsDataURL(file);

            // Clear current photo URL
            currentPhotoUrl.value = '';
        } else {
            alert('Please upload an image file.');
        }
    }
};

// Handle file selection
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            selectedFile.value = file;

            // Create preview of the selected image
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.value = e.target.result;
            };
            reader.readAsDataURL(file);

            // Remove the current photo reference if there was one
            currentPhotoUrl.value = '';
        } else {
            alert('Please upload an image file.');
            if (resultPhotoInput.value) {
                resultPhotoInput.value.value = '';
            }
        }
    }
};

// Remove selected image
const removeImage = () => {
    selectedFile.value = null;
    imagePreview.value = '';
    currentPhotoUrl.value = '';
    if (resultPhotoInput.value) {
        resultPhotoInput.value.value = '';
    }
    // Also clear the photo path in the editable data
    editableQuizData.value.quiz_answer.photo = '';
};

// Add a blank keyword input
const addKeyword = () => {
  if (!Array.isArray(editableQuizData.value.answer_keywords)) {
    editableQuizData.value.answer_keywords = []
  }
  editableQuizData.value.answer_keywords.push('')
}

// Remove one by index
const removeKeyword = (i) => {
  editableQuizData.value.answer_keywords.splice(i, 1)
}

// Edit quiz function
const editQuiz = async (quiz) => {
    try {
        // Reset file-related states
        selectedFile.value = null
        imagePreview.value = ''
        currentPhotoUrl.value = ''

        // Fetch full quiz details to ensure we have all data
        const response = await axios.get(
            `https://quiz.thecore.in/backend-dev/admin/quiz-history/${quiz.id}`,
            { withCredentials: true }
        )

        if (response.data.status === 'success') {
            const quizData = response.data.data

            // Set non-editable quiz data
            editQuizData.value = {
                id: quizData.id,
                created_at: quizData.created_at,
                participants_count: quizData.participants_count
            }

            // Parse quiz_data JSON
            let parsedQuizData = {}
            try {
                parsedQuizData = typeof quizData.quiz_data === 'string'
                    ? JSON.parse(quizData.quiz_data)
                    : quizData.quiz_data
            } catch (e) {
                console.error('Error parsing quiz data:', e)
                parsedQuizData = {}
            }

            // Set up editable data structure
            parseQuizDataForEdit(parsedQuizData)

            // If there's a photo, set the currentPhotoUrl
            if (editableQuizData.value.quiz_answer.photo) {
                currentPhotoUrl.value = `https://quiz.thecore.in/backend-dev/${editableQuizData.value.quiz_answer.photo}`
            }

            // Show edit modal
            showEditModal.value = true
        } else {
            alert('Failed to fetch quiz details for editing: ' + response.data.message)
        }
    } catch (error) {
        console.error('Error preparing quiz for edit:', error)
        alert('Error preparing quiz for edit.')
    }
}

// Parse quiz data for editing
const parseQuizDataForEdit = (data) => {
    // Initialize with defaults or existing values
    editableQuizData.value = {
        quiz_title: data.quiz_title || '',
        quiz_description: data.quiz_description || '',
        quiz_difficulty: data.quiz_difficulty || 'easy',
        quiz_duration: data.quiz_duration,
        quiz_question: data.quiz_question || '',
        clues: Array.isArray(data.clues) ? [...data.clues] : [],
        answer_keywords: Array.isArray(data.answer_keywords)
            ? [...data.answer_keywords]
            : [],
        quiz_answer: {
            name: data.quiz_answer?.name || '',
            timeline: data.quiz_answer?.timeline || '',
            description: data.quiz_answer?.description || '',
            photo: data.quiz_answer?.photo || '',
            sections: Array.isArray(data.quiz_answer?.sections)
                ? data.quiz_answer.sections.map(section => {
                    // Determine input type based on content
                    let inputType = 'bullet'; // Default

                    // If description has content and bulletPoints is empty or doesn't exist
                    if (section.description && section.description.trim() &&
                        (!Array.isArray(section.bulletPoints) || section.bulletPoints.length === 0 ||
                            (section.bulletPoints.length === 1 && !section.bulletPoints[0].trim()))) {
                        inputType = 'paragraph';
                    }
                    // If bulletPoints has content
                    else if (Array.isArray(section.bulletPoints) && section.bulletPoints.some(point => point.trim())) {
                        inputType = 'bullet';
                    }

                    return {
                        title: section.title || '',
                        inputType: inputType,
                        description: section.description || '',
                        bulletPoints: Array.isArray(section.bulletPoints) ? [...section.bulletPoints] : ['']
                    }
                })
                : []
        }
    }

    // If no clues, initialize with empty array
    if (!editableQuizData.value.clues.length) {
        editableQuizData.value.clues = []
    }

    // If no sections, initialize with empty array
    if (!editableQuizData.value.quiz_answer.sections.length) {
        editableQuizData.value.quiz_answer.sections = []
    }
}
// Add a new clue
const addClue = () => {
    editableQuizData.value.clues.push({
        title: '',
        text: ''
    })
}

// Remove a clue
const removeClue = (index) => {
    editableQuizData.value.clues.splice(index, 1)
}

// Add a new section to the answer
const addSection = () => {
    editableQuizData.value.quiz_answer.sections.push({
        title: '',
        inputType: 'bullet',
        description: '',
        bulletPoints: ['']
    })
}

// Remove a section
const removeSection = (index) => {
    editableQuizData.value.quiz_answer.sections.splice(index, 1)
}

// Add a bullet point to a section
const addBulletPoint = (sectionIndex) => {
    editableQuizData.value.quiz_answer.sections[sectionIndex].bulletPoints.push('')
}

// Remove a bullet point
const removeBulletPoint = (sectionIndex, pointIndex) => {
    editableQuizData.value.quiz_answer.sections[sectionIndex].bulletPoints.splice(pointIndex, 1)
}
// Close edit modal
const closeEditModal = () => {
    showEditModal.value = false
    validationError.value = ''
    // Reset file related states
    selectedFile.value = null
    imagePreview.value = ''
    currentPhotoUrl.value = ''
}
// Save quiz changes
const saveQuizChanges = async () => {
    validationError.value = ''

    // Validate form data
    if (!validateQuizData()) {
        return
    }

    try {
        // Prepare form data for submission
        const formData = new FormData()

        // Get the current quiz data
        const response = await axios.get(
            `https://quiz.thecore.in/backend-dev/admin/quiz-history/${editQuizData.value.id}`,
            { withCredentials: true }
        )

        if (response.data.status === 'success') {
            const originalData = response.data.data
            let quizDataCopy = { ...editableQuizData.value }

            // Handle photo separately
            if (selectedFile.value) {
                formData.append('result_photo', selectedFile.value)
                // The backend will handle storing the path, so we don't need to set it here
            } else if (!currentPhotoUrl.value && editableQuizData.value.quiz_answer.photo) {
                // User removed the existing photo
                quizDataCopy.quiz_answer.photo = ''
            }

            // Stringify the updated quiz data
            formData.append('quiz_data', JSON.stringify(quizDataCopy))

            // Append existing data that shouldn't be changed
            formData.append('quiz_results', originalData.quiz_results || '{}')
            formData.append('participants_ids', originalData.participants_ids || '[]')
            formData.append('participants_count', originalData.participants_count)

            // Send update request
            const updateResponse = await axios.post(
                `https://quiz.thecore.in/backend-dev/admin/quiz-history/update/${editQuizData.value.id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (updateResponse.data.status === 'success') {
                // Update local quiz data
                fetchQuizzes()
                alert('Quiz updated successfully!')
                closeEditModal()
            } else {
                validationError.value = 'Failed to save: ' + updateResponse.data.message
            }
        } else {
            validationError.value = 'Failed to retrieve original quiz data: ' + response.data.message
        }
    } catch (error) {
        console.error('Error updating quiz:', error)
        validationError.value = 'Error updating quiz: ' + error.message
    }
}

// Validate quiz data before submission
const validateQuizData = () => {
    // Required fields validation
    if (!editableQuizData.value.quiz_title.trim()) {
        validationError.value = 'Quiz title is required.'
        return false
    }

    if (!editableQuizData.value.quiz_question.trim()) {
        validationError.value = 'Quiz question is required.'
        return false
    }

    // Validate quiz answer
    if (!editableQuizData.value.quiz_answer.name.trim()) {
        validationError.value = 'Answer name is required.'
        return false
    }

    // Validate sections if they exist
    for (let i = 0; i < editableQuizData.value.quiz_answer.sections.length; i++) {
        const section = editableQuizData.value.quiz_answer.sections[i]

        if (!section.title.trim()) {
            validationError.value = `Section ${i + 1} title is required.`
            return false
        }

        // If bullet points, ensure at least one is provided
        if (section.inputType === 'bullet' &&
            (!section.bulletPoints.length || !section.bulletPoints.some(p => p.trim()))) {
            validationError.value = `Section ${i + 1} must have at least one bullet point.`
            return false
        }
    }

    return true
}
onMounted(() => {
    authStore.checkAuth().then(() => {
        if (authStore.isAuthenticated) {
            fetchQuizzes()
        } else {
            alert('Not authenticated. Please log in again.')
        }
    })
    const fileDropArea = document.querySelector('.file-upload-ui');
    if (fileDropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        fileDropArea.addEventListener('dragover', () => {
            fileDropArea.classList.add('file-drag-over');
        }, false);

        fileDropArea.addEventListener('dragleave', () => {
            fileDropArea.classList.remove('file-drag-over');
        }, false);

        fileDropArea.addEventListener('drop', handleFileDrop, false);

        fileDropArea.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-image-btn') && !imagePreview.value && !currentPhotoUrl.value) {
                triggerFileInput();
            }
        }, false);
    }
})
</script>

<style scoped>
/* Overall container styling */
.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Poppins', sans-serif;
    /* background: #f7f7f7; */
    color: #002b45;
}

h1 {
    margin-bottom: 20px;
    color: #002b45;
}

/* Quiz Management Section */
.quiz-management {
    margin-top: 30px;
}

.loading,
.no-data {
    padding: 20px;
    text-align: center;
    background-color: #e0f2f1;
    border-radius: 4px;
    color: #002b45;
}

.quiz-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.quiz-item {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 43, 69, 0.1);
    padding: 20px;
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.quiz-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 43, 69, 0.15);
}

.quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.quiz-header h3 {
    font-size: 20px;
    margin: 0;
    color: #002b45;
}

.quiz-date {
    font-size: 14px;
    color: #555;
}

.quiz-info p {
    font-size: 16px;
    margin: 10px 0;
    color: #004d40;
}

.quiz-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.action-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.action-btn.edit {
    background-color: #2196F3;
    color: #fff;
}

.action-btn.edit:hover {
    background-color: #1976D2;
}

.action-btn.delete {
    background-color: #c62828;
    color: #fff;
}

.action-btn.delete:hover {
    background-color: #b71c1c;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
}

/* Modal Content */
.modal-content {
    background: #fff;
    border-radius: 8px;
    width: 90%;
    max-width: 750px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 6px 20px rgba(0, 43, 69, 0.2);
    position: relative;
}

/* Header: Title and Close Icon */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.modal-header h2 {
    margin: 0;
    color: #002b45;
    font-size: 24px;
}

.modal-close-btn {
    background: transparent;
    border: none;
    font-size: 30px;
    color: #002b45;
    cursor: pointer;
}

/* Modal Body: Organized Sections */
.modal-body {
    padding: 20px 30px;
}

.modal-body section {
    margin-bottom: 20px;
}

.modal-body h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #004d40;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 5px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
}

.info-label {
    font-weight: 600;
    color: #333;
}

.info-value {
    color: #555;
}

/* Optional Chart Section */
.chart-container {
    height: 300px;
    margin-top: 10px;
}

/* Modal Footer */
.modal-footer {
    padding: 15px 30px;
    border-top: 1px solid #e0e0e0;
    text-align: right;
    position: sticky;
    bottom: 0;
    background: white;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.close-btn {
    background: #004d40;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
}

/* Edit Form Styling */
.edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-group label {
    font-weight: 600;
    color: #004d40;
    margin-top: 10px;
}

.form-control {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 16px;
}

.json-editor {
    font-family: monospace;
    white-space: pre;
    resize: vertical;
    min-height: 100px;
}

.text-muted {
    color: #757575;
    font-size: 14px;
}

.validation-error {
    color: #c62828;
    background-color: #ffebee;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.primary-btn {
    background: #004d40;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
}

.secondary-btn {
    background: #e0e0e0;
    color: #333;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
}

/* Form Section Styles */
.form-section {
    margin-bottom: 25px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #004d40;
    font-size: 18px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
}

.subsection {
    margin-top: 20px;
}

.subsection h4 {
    color: #004d40;
    font-size: 16px;
    margin-bottom: 10px;
}

/* Item Card Styles */
.item-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.item-header h4 {
    margin: 0;
    color: #004d40;
    font-size: 16px;
}

.no-items-message {
    color: #757575;
    font-style: italic;
    margin-bottom: 10px;
}

/* Bullet Points Container */
.bullet-points-container {
    margin-top: 10px;
    margin-bottom: 10px;
}

.bullet-point-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

/* Button Styles */
.add-btn {
    background-color: #26a69a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 10px;
}

.add-btn:hover {
    background-color: #00897b;
}

.add-small-btn {
    background-color: #26a69a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    margin-top: 5px;
}

.add-small-btn:hover {
    background-color: #00897b;
}

.remove-btn {
    background-color: #ef5350;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
}

.remove-btn:hover {
    background-color: #d32f2f;
}

.small-remove-btn {
    background-color: #ef5350;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.small-remove-btn:hover {
    background-color: #d32f2f;
}

/* Info Row Styles */
.info-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
}

.info-label {
    font-weight: 600;
    color: #333;
}

.info-value {
    color: #555;
}

/* File Upload Styling */
.file-upload-group {
    margin-bottom: 24px;
}

.file-upload-container {
    position: relative;
    width: 100%;
}

.file-input {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
}

.file-upload-ui {
    border: 2px dashed #26a69a;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background-color: #f0f7f6;
    transition: all 0.3s ease;
    cursor: pointer;
}

.file-upload-ui:hover {
    border-color: #004d40;
    background-color: #e0f2f1;
}

.file-upload-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.upload-icon {
    color: #26a69a;
    margin-bottom: 12px;
}

.upload-text {
    color: #555;
    margin-bottom: 12px;
    font-size: 16px;
}

.browse-btn {
    background-color: #26a69a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.browse-btn:hover {
    background-color: #004d40;
}

.file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 12px;
    color: #004d40;
    font-size: 14px;
}

.file-size {
    color: #666;
    font-size: 12px;
    margin-top: 4px;
}

.file-upload-preview {
    position: relative;
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    display: flex;
    justify-content: center;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 4px;
}

.remove-image-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
}

.remove-image-btn:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.remove-icon {
    font-size: 20px;
    line-height: 1;
}

/* Validation Error */
.validation-error {
    color: #c62828;
    background-color: #ffebee;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.file-drag-over {
    border-color: #004d40;
    background-color: #e0f2f1;
    box-shadow: 0 0 10px rgba(0, 77, 64, 0.2);
}
/* Answer-Keywords Section */
.keywords-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.keyword-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.keyword-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.remove-keyword-btn {
  background: #ef5350;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.remove-keyword-btn:hover {
  background: #d32f2f;
}
.keyword-counter {
  font-size: 14px;
  font-weight: 500;
  color: #004d40;
}
.add-btn {
  background-color: #26a69a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}
.add-btn:hover {
  background-color: #00897b;
}

/* Responsive Tweaks */
@media (min-width: 768px) {
    .modal-content {
        width: 80%;
    }

    .quiz-list {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
}
</style>