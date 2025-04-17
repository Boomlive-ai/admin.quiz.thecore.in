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
                        <h3>Quiz #{{ quiz.id }}</h3>
                        <span class="quiz-date">{{ formatDate(quiz.created_at) }}</span>
                    </div>
                    <div class="quiz-info">
                        <p>Participants: {{ quiz.participants_count }}</p>
                    </div>
                    <div class="quiz-actions">
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
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
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

// Close modal
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

onMounted(() => {
    authStore.checkAuth().then(() => {
        if (authStore.isAuthenticated) {
            fetchQuizzes()
        } else {
            alert('Not authenticated. Please log in again.')
        }
    })
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
}

.action-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
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

/* Responsive Tweaks */
@media (min-width: 768px) {
    .modal-content {
        width: 80%;
    }
}

.chart-container {
    margin-top: 20px;
    position: relative;
    height: 300px;
    /* Define a fixed height for the chart */
}

.close-btn {
    background: #004d40;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
}

/* Responsive Tweaks */
@media (min-width: 768px) {
    .quiz-list {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
}
</style>