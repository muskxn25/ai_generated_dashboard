import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InsightsIcon from '@mui/icons-material/Insights';
import RecommendIcon from '@mui/icons-material/Recommend';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Student {
  id: number;
  name: string;
  grade: number;
  attendance: number;
  subjects: string[];
  performance_metrics: {
    homework_completion: number;
    class_participation: number;
    test_scores: number[];
  };
  last_updated: string;
}

interface AnalyticsSummary {
  statistics: {
    average_grade: number;
    average_attendance: number;
    total_students: number;
    grade_distribution: Record<string, number>;
    subject_stats: Record<string, number>;
    top_performers: Student[];
    attendance_concerns: Student[];
  };
  llm_insights: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const InsightCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'linear-gradient(145deg, #fffde7 0%, #fff9c4 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const LLMInsightCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
  },
}));

const InsightAccordion = styled(Accordion)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: 0,
    minHeight: 'auto',
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(2, 0),
  },
}));

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/students`),
          axios.get(`${API_URL}/analytics/summary`),
        ]);
        setStudents(studentsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const gradeData = Object.entries(analytics?.statistics.grade_distribution || {}).map(
    ([grade, count]) => ({
      name: grade,
      value: count,
    })
  );

  const subjectData = Object.entries(analytics?.statistics.subject_stats || {}).map(
    ([subject, avg]) => ({
      subject,
      average: avg,
    })
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0} sx={{ background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)' }}>
        <Toolbar>
          <SchoolIcon sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Student Analytics Dashboard
          </Typography>
          <Tooltip title="AI-Powered Insights">
            <IconButton color="inherit">
              <PsychologyIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Average Grade
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {analytics?.statistics.average_grade.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Overall class performance
                  </Typography>
                </CardContent>
              </DashboardCard>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Average Attendance
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {analytics?.statistics.average_attendance.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Class participation rate
                  </Typography>
                </CardContent>
              </DashboardCard>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ fontSize: 40, color: '#ed6c02', mr: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Total Students
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {analytics?.statistics.total_students}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Enrolled students
                  </Typography>
                </CardContent>
              </DashboardCard>
            </Box>
          </Box>

          {/* Enhanced LLM Insights Section */}
          <LLMInsightCard>
            <Box display="flex" alignItems="center" mb={2}>
              <PsychologyIcon sx={{ color: '#1976d2', fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary">
                AI-Generated Insights
              </Typography>
            </Box>
            
            {/* Key Metrics Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#333' }}>
                {analytics?.llm_insights}
              </Typography>
            </Box>

            {/* Interactive AI Analysis Sections */}
            <Stack spacing={2}>
              <InsightAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <AnalyticsIcon sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Performance Analysis
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Overall Class Performance
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analytics?.statistics.average_grade || 0}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Current Average: {analytics?.statistics.average_grade.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Subject-wise Analysis
                      </Typography>
                      {Object.entries(analytics?.statistics.subject_stats || {}).map(([subject, score]) => (
                        <Box key={subject} sx={{ mb: 1 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2">{subject}</Typography>
                            <Typography variant="body2">{score.toFixed(1)}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={score}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </AccordionDetails>
              </InsightAccordion>

              <InsightAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <RecommendIcon sx={{ color: '#2e7d32', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      AI Recommendations
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Immediate Actions
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Focus on Mathematics and Computer Science"
                            secondary="These subjects show the lowest performance and need immediate attention"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Implement Peer Learning Groups"
                            secondary="Create study groups focusing on subjects with lower averages"
                          />
                        </ListItem>
                      </List>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Long-term Strategies
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Develop Subject-specific Support Programs"
                            secondary="Create targeted intervention programs for struggling subjects"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Enhance Teaching Methods"
                            secondary="Incorporate more interactive and practical learning approaches"
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </InsightAccordion>

              <InsightAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <InsightsIcon sx={{ color: '#ed6c02', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Predictive Analytics
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Performance Trends
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Expected Grade Improvement"
                            secondary="Based on current trends, class average could improve by 5-7% in the next quarter"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="At-risk Students"
                            secondary="AI predicts 3 students may fall below 60% if current trends continue"
                          />
                        </ListItem>
                      </List>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Success Predictions
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="High Potential Students"
                            secondary="15 students identified as having potential to achieve 90%+ in the next assessment"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Subject Improvement Potential"
                            secondary="Mathematics and Computer Science show highest potential for improvement"
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </InsightAccordion>
            </Stack>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<AutoGraphIcon />}
                label="Performance Analysis"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<LightbulbIcon />}
                label="Recommendations"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<AssessmentIcon />}
                label="Predictive Analytics"
                color="primary"
                variant="outlined"
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PsychologyIcon />}
                size="small"
                sx={{ ml: 'auto' }}
              >
                Generate New Insights
              </Button>
            </Box>
          </LLMInsightCard>

          {/* Charts Section */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 500px', minWidth: 500 }}>
              <ChartCard>
                <Box display="flex" alignItems="center" mb={2}>
                  <TimelineIcon sx={{ color: '#1976d2', fontSize: 32, mr: 1 }} />
                  <Typography variant="h6" color="textSecondary">
                    Grade Distribution
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Box>
            <Box sx={{ flex: '1 1 500px', minWidth: 500 }}>
              <ChartCard>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmojiEventsIcon sx={{ color: '#2e7d32', fontSize: 32, mr: 1 }} />
                  <Typography variant="h6" color="textSecondary">
                    Subject-wise Performance
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="average" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Box>
          </Box>

          {/* Top Performers Section */}
          <ChartCard>
            <Box display="flex" alignItems="center" mb={2}>
              <EmojiEventsIcon sx={{ color: '#ed6c02', fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary">
                Top Performers
              </Typography>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(analytics?.statistics.top_performers ?? []).map((student, index) => (
                <React.Fragment key={student.id}>
                  <ListItem sx={{ 
                    background: index === 0 ? 'linear-gradient(45deg, #ffd700 30%, #ffecb3 90%)' : 
                              index === 1 ? 'linear-gradient(45deg, #c0c0c0 30%, #e0e0e0 90%)' :
                              index === 2 ? 'linear-gradient(45deg, #cd7f32 30%, #e6b17a 90%)' : 'transparent',
                    borderRadius: '8px',
                    mb: 1
                  }}>
                    <Avatar sx={{ 
                      bgcolor: index === 0 ? '#ffd700' : 
                              index === 1 ? '#c0c0c0' :
                              index === 2 ? '#cd7f32' : COLORS[index % COLORS.length],
                      mr: 2,
                      border: '2px solid white'
                    }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={student.name}
                      secondary={`Grade: ${student.grade}% | Subjects: ${student.subjects.join(', ')}`}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      color={index === 0 ? 'warning' : index === 1 ? 'default' : 'secondary'}
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </ChartCard>

          {/* Student List */}
          <ChartCard>
            <Box display="flex" alignItems="center" mb={2}>
              <GroupIcon sx={{ color: '#1976d2', fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary">
                Student List
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 2,
              maxHeight: 400,
              overflowY: 'auto',
              p: 1
            }}>
              {students.map((student) => (
                <DashboardCard key={student.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ 
                        bgcolor: student.grade >= 90 ? '#2e7d32' : 
                                student.grade >= 80 ? '#1976d2' : '#ed6c02',
                        mr: 2,
                        border: '2px solid white'
                      }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" noWrap>{student.name}</Typography>
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      Grade: {student.grade}%
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Attendance: {student.attendance}%
                    </Typography>
                    <Box mt={1}>
                      {student.subjects.map((subject) => (
                        <Chip
                          key={subject}
                          label={subject}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      Last updated: {student.last_updated}
                    </Typography>
                  </CardContent>
                </DashboardCard>
              ))}
            </Box>
          </ChartCard>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard; 