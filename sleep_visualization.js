// Sleep Visualization JavaScript
// DSC 106 Final Project

let sleepData = [];
let currentData = null;
let chart = null;

// Color mapping for sleep stages
const stageColors = {
    'Wake': '#ff6b6b',
    'REM': '#4ecdc4', 
    'N1': '#45b7d1',
    'N2': '#96ceb4',
    'N3': '#feca57',
    'N4': '#f39c12',
    'Movement': '#e74c3c',
    'Unknown': '#95a5a6'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sleep visualization app starting...');
    loadSleepData();
});

async function loadSleepData() {
    try {
        // Try to load the combined data file
        const response = await fetch('converted_json_data/combined_sleep_data.json');
        if (!response.ok) {
            throw new Error('Combined data not found, loading sample data');
        }
        
        sleepData = await response.json();
        console.log(`Loaded ${sleepData.length} sleep recordings`);
        
    } catch (error) {
        console.log('Loading sample data for demonstration');
        // Load sample data for GitHub Pages demo
        sleepData = generateSampleData();
    }
    
    populateControls();
    updateVisualization();
    document.getElementById('loading').style.display = 'none';
}

function generateSampleData() {
    // Generate sample sleep data for demonstration
    const sampleRecordings = [];
    
    for (let i = 0; i < 20; i++) {
        const subjectId = 10 + i;
        const age = 25 + Math.floor(Math.random() * 50);
        const condition = Math.random() > 0.5 ? 'J' : 'A'; // J = medication, A = placebo
        
        // Generate realistic hypnogram
        const hypnogram = generateRealisticHypnogram(age, condition === 'J');
        
        sampleRecordings.push({
            filename: `ST70${subjectId}${condition}0-Hypnogram.edf`,
            subject_id: subjectId,
            condition: condition,
            data: {
                metadata: {
                    subject_id: subjectId,
                    condition: condition,
                    study_type: 'Sleep Telemetry',
                    subject_info: {
                        age: age,
                        gender: Math.random() > 0.5 ? 'M' : 'F'
                    },
                    recording_info: {
                        duration_hours: 8,
                        total_epochs: hypnogram.length
                    }
                },
                hypnogram: hypnogram,
                summary_stats: calculateSleepStats(hypnogram)
            }
        });
    }
    
    return sampleRecordings;
}

function generateRealisticHypnogram(age, withMedication) {
    const hypnogram = [];
    let currentTime = 0;
    const epochDuration = 30; // 30-second epochs
    const totalMinutes = 480; // 8 hours
    
    // Sleep onset (Wake -> N1 -> N2)
    addEpochs(hypnogram, 'Wake', withMedication ? 2 : 5, currentTime, epochDuration);
    currentTime += (withMedication ? 2 : 5) * epochDuration;
    
    addEpochs(hypnogram, 'N1', 3, currentTime, epochDuration);
    currentTime += 3 * epochDuration;
    
    // First sleep cycle
    addEpochs(hypnogram, 'N2', 20, currentTime, epochDuration);
    currentTime += 20 * epochDuration;
    
    // Deep sleep (less in older adults)
    const deepSleepMinutes = age > 60 ? 15 : 30;
    addEpochs(hypnogram, 'N3', Math.floor(deepSleepMinutes / 0.5), currentTime, epochDuration);
    currentTime += deepSleepMinutes * 60;
    
    // Continue with more realistic sleep architecture
    while (currentTime < totalMinutes * 60) {
        const remaining = (totalMinutes * 60 - currentTime) / 60;
        
        if (remaining > 120) {
            // REM period
            addEpochs(hypnogram, 'REM', 20, currentTime, epochDuration);
            currentTime += 20 * epochDuration;
            
            // Back to N2
            addEpochs(hypnogram, 'N2', 40, currentTime, epochDuration);
            currentTime += 40 * epochDuration;
            
            // Occasional wake (more in older adults)
            if (age > 50 && Math.random() > 0.7) {
                addEpochs(hypnogram, 'Wake', 2, currentTime, epochDuration);
                currentTime += 2 * epochDuration;
            }
        } else {
            // Final light sleep and wake
            addEpochs(hypnogram, 'N2', Math.floor(remaining / 2), currentTime, epochDuration);
            currentTime += (remaining / 2) * 60;
            
            addEpochs(hypnogram, 'Wake', Math.floor(remaining / 2), currentTime, epochDuration);
            break;
        }
    }
    
    return hypnogram;
}

function addEpochs(hypnogram, stage, count, startTime, epochDuration) {
    for (let i = 0; i < count; i++) {
        hypnogram.push({
            epoch: hypnogram.length,
            onset_seconds: startTime + (i * epochDuration),
            duration_seconds: epochDuration,
            onset_minutes: (startTime + (i * epochDuration)) / 60,
            onset_hours: (startTime + (i * epochDuration)) / 3600,
            stage: stage,
            stage_numeric: getStageNumeric(stage)
        });
    }
}

function getStageNumeric(stage) {
    const mapping = {
        'Wake': 5,
        'REM': 4,
        'N1': 3,
        'N2': 2,
        'N3': 1,
        'N4': 0,
        'Movement': 6,
        'Unknown': -1
    };
    return mapping[stage] || -1;
}

function calculateSleepStats(hypnogram) {
    const totalEpochs = hypnogram.length;
    const stageCounts = {};
    
    hypnogram.forEach(epoch => {
        stageCounts[epoch.stage] = (stageCounts[epoch.stage] || 0) + 1;
    });
    
    const sleepEpochs = totalEpochs - (stageCounts['Wake'] || 0);
    const sleepEfficiency = (sleepEpochs / totalEpochs) * 100;
    const remPercentage = ((stageCounts['REM'] || 0) / totalEpochs) * 100;
    const deepSleepPercentage = (((stageCounts['N3'] || 0) + (stageCounts['N4'] || 0)) / totalEpochs) * 100;
    
    return {
        sleep_efficiency: sleepEfficiency,
        rem_percentage: remPercentage,
        deep_sleep_percentage: deepSleepPercentage,
        total_sleep_time_hours: (sleepEpochs * 0.5) / 60, // 30-second epochs
        stage_percentages: Object.keys(stageCounts).reduce((acc, stage) => {
            acc[stage] = (stageCounts[stage] / totalEpochs) * 100;
            return acc;
        }, {})
    };
}

function populateControls() {
    const subjectSelect = document.getElementById('subject-select');
    
    // Clear existing options except the first one
    while (subjectSelect.children.length > 1) {
        subjectSelect.removeChild(subjectSelect.lastChild);
    }
    
    // Add subjects to dropdown
    const subjects = [...new Set(sleepData.map(d => d.subject_id))].sort();
    subjects.forEach(subjectId => {
        const option = document.createElement('option');
        option.value = subjectId;
        option.textContent = `Subject ${subjectId}`;
        subjectSelect.appendChild(option);
    });
}

function updateVisualization() {
    const filters = getFilters();
    const filteredData = applyFilters(sleepData, filters);
    
    if (filteredData.length === 0) {
        console.log('No data matches current filters');
        return;
    }
    
    // Select data to display
    currentData = selectDataToDisplay(filteredData, filters);
    
    if (currentData && currentData.data.hypnogram) {
        createHypnogram(currentData.data.hypnogram);
        updateStatistics(currentData.data.summary_stats);
    }
}

function getFilters() {
    return {
        subject: document.getElementById('subject-select').value,
        condition: document.getElementById('condition-filter').value,
        age: document.getElementById('age-filter').value,
        timeScale: document.getElementById('time-scale').value
    };
}

function applyFilters(data, filters) {
    return data.filter(recording => {
        const metadata = recording.data.metadata;
        
        // Subject filter
        if (filters.subject !== 'random' && recording.subject_id.toString() !== filters.subject) {
            return false;
        }
        
        // Condition filter
        if (filters.condition !== 'all') {
            const condition = recording.condition;
            if (filters.condition === 'medication' && condition !== 'J') return false;
            if (filters.condition === 'placebo' && condition !== 'A') return false;
        }
        
        // Age filter
        if (filters.age !== 'all' && metadata.subject_info.age) {
            const age = metadata.subject_info.age;
            if (filters.age === 'young' && (age < 18 || age > 30)) return false;
            if (filters.age === 'middle' && (age < 31 || age > 50)) return false;
            if (filters.age === 'older' && age < 51) return false;
        }
        
        return true;
    });
}

function selectDataToDisplay(filteredData, filters) {
    if (filters.subject === 'random') {
        // Select random recording
        return filteredData[Math.floor(Math.random() * filteredData.length)];
    } else {
        // Select specific subject
        return filteredData.find(d => d.subject_id.toString() === filters.subject) || filteredData[0];
    }
}

function createHypnogram(hypnogramData) {
    const container = d3.select('#hypnogram-chart');
    container.selectAll('*').remove();
    
    if (!hypnogramData || hypnogramData.length === 0) {
        container.append('p').text('No hypnogram data available');
        return;
    }
    
    const margin = {top: 20, right: 30, bottom: 60, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const timeScale = document.getElementById('time-scale').value;
    const maxTime = d3.max(hypnogramData, d => timeScale === 'hours' ? d.onset_hours : d.onset_minutes);
    
    const xScale = d3.scaleLinear()
        .domain([0, maxTime])
        .range([0, width]);
    
    const stages = ['Wake', 'REM', 'N1', 'N2', 'N3'];
    const yScale = d3.scaleBand()
        .domain(stages)
        .range([0, height])
        .padding(0.1);
    
    // Group consecutive epochs of the same stage
    const groupedData = groupConsecutiveStages(hypnogramData);
    
    // Draw sleep stage rectangles
    g.selectAll('.sleep-rect')
        .data(groupedData)
        .enter().append('rect')
        .attr('class', 'sleep-rect')
        .attr('x', d => xScale(timeScale === 'hours' ? d.start_hours : d.start_minutes))
        .attr('y', d => yScale(d.stage))
        .attr('width', d => {
            const start = timeScale === 'hours' ? d.start_hours : d.start_minutes;
            const end = timeScale === 'hours' ? d.end_hours : d.end_minutes;
            return xScale(end) - xScale(start);
        })
        .attr('height', yScale.bandwidth())
        .attr('fill', d => stageColors[d.stage] || '#95a5a6')
        .attr('opacity', 0.8)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showTooltip(event, d, timeScale);
        })
        .on('mouseout', function(event, d) {
            d3.select(this).attr('opacity', 0.8);
            hideTooltip();
        })
        .on('click', function(event, d) {
            // Interactive feature: click to highlight stage
            highlightStage(d.stage);
        });
    
    // Add axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => timeScale === 'hours' ? `${d.toFixed(1)}h` : `${Math.floor(d)}m`);
    
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(`Time (${timeScale})`);
    
    const yAxis = d3.axisLeft(yScale);
    
    g.append('g')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .text('Sleep Stage');
}

function groupConsecutiveStages(hypnogramData) {
    if (!hypnogramData || hypnogramData.length === 0) return [];
    
    const grouped = [];
    let currentGroup = {
        stage: hypnogramData[0].stage,
        start_seconds: hypnogramData[0].onset_seconds,
        start_minutes: hypnogramData[0].onset_minutes,
        start_hours: hypnogramData[0].onset_hours,
        duration_seconds: hypnogramData[0].duration_seconds,
        epochs: [hypnogramData[0]]
    };
    
    for (let i = 1; i < hypnogramData.length; i++) {
        const epoch = hypnogramData[i];
        
        if (epoch.stage === currentGroup.stage) {
            // Same stage, extend the group
            currentGroup.duration_seconds += epoch.duration_seconds;
            currentGroup.epochs.push(epoch);
        } else {
            // New stage, finish current group and start new one
            currentGroup.end_seconds = currentGroup.start_seconds + currentGroup.duration_seconds;
            currentGroup.end_minutes = currentGroup.end_seconds / 60;
            currentGroup.end_hours = currentGroup.end_seconds / 3600;
            currentGroup.duration_minutes = currentGroup.duration_seconds / 60;
            
            grouped.push(currentGroup);
            
            currentGroup = {
                stage: epoch.stage,
                start_seconds: epoch.onset_seconds,
                start_minutes: epoch.onset_minutes,
                start_hours: epoch.onset_hours,
                duration_seconds: epoch.duration_seconds,
                epochs: [epoch]
            };
        }
    }
    
    // Don't forget the last group
    currentGroup.end_seconds = currentGroup.start_seconds + currentGroup.duration_seconds;
    currentGroup.end_minutes = currentGroup.end_seconds / 60;
    currentGroup.end_hours = currentGroup.end_seconds / 3600;
    currentGroup.duration_minutes = currentGroup.duration_seconds / 60;
    
    grouped.push(currentGroup);
    
    return grouped;
}

function showTooltip(event, d, timeScale) {
    const tooltip = d3.select('#tooltip');
    const duration = timeScale === 'hours' ? 
        `${d.duration_minutes.toFixed(1)} minutes` : 
        `${Math.floor(d.duration_minutes)} min ${Math.floor((d.duration_minutes % 1) * 60)} sec`;
    
    const startTime = timeScale === 'hours' ? 
        `${d.start_hours.toFixed(2)}h` : 
        `${Math.floor(d.start_minutes)}:${String(Math.floor((d.start_minutes % 1) * 60)).padStart(2, '0')}`;
    
    tooltip.style('opacity', 1)
        .html(`
            <strong>${d.stage}</strong><br/>
            Start: ${startTime}<br/>
            Duration: ${duration}<br/>
            Epochs: ${d.epochs.length}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function hideTooltip() {
    d3.select('#tooltip').style('opacity', 0);
}

function highlightStage(selectedStage) {
    // Interactive feature: highlight all segments of the selected stage
    d3.selectAll('.sleep-rect')
        .transition()
        .duration(300)
        .attr('opacity', d => d.stage === selectedStage ? 1 : 0.3)
        .attr('stroke-width', d => d.stage === selectedStage ? 3 : 1);
    
    // Reset after 2 seconds
    setTimeout(() => {
        d3.selectAll('.sleep-rect')
            .transition()
            .duration(300)
            .attr('opacity', 0.8)
            .attr('stroke-width', 1);
    }, 2000);
}

function updateStatistics(stats) {
    const statsContainer = d3.select('#sleep-stats');
    statsContainer.selectAll('*').remove();
    
    if (!stats) return;
    
    const statCards = [
        {
            value: `${stats.sleep_efficiency.toFixed(1)}%`,
            label: 'Sleep Efficiency',
            description: 'Percentage of time in bed spent asleep'
        },
        {
            value: `${stats.rem_percentage.toFixed(1)}%`,
            label: 'REM Sleep',
            description: 'Percentage of sleep time in REM stage'
        },
        {
            value: `${stats.deep_sleep_percentage.toFixed(1)}%`,
            label: 'Deep Sleep',
            description: 'Percentage of sleep time in N3/N4 stages'
        },
        {
            value: `${stats.total_sleep_time_hours.toFixed(1)}h`,
            label: 'Total Sleep Time',
            description: 'Total time spent in sleep stages'
        }
    ];
    
    const cards = statsContainer.selectAll('.stat-card')
        .data(statCards)
        .enter()
        .append('div')
        .attr('class', 'stat-card')
        .style('opacity', 0);
    
    cards.append('div')
        .attr('class', 'stat-value')
        .text(d => d.value);
    
    cards.append('div')
        .attr('class', 'stat-label')
        .text(d => d.label);
    
    // Add hover effect for additional info
    cards.on('mouseover', function(event, d) {
        showTooltip(event, {stage: d.label, duration_minutes: 0}, 'hours');
        d3.select('#tooltip').html(`
            <strong>${d.label}</strong><br/>
            ${d.description}<br/>
            Value: ${d.value}
        `);
    })
    .on('mouseout', hideTooltip);
    
    // Animate cards appearing
    cards.transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .style('opacity', 1);
}

// Additional interactive features
function compareConditions() {
    // This function could be expanded to show side-by-side comparisons
    // of medication vs placebo conditions
    console.log('Compare conditions feature - to be implemented');
}

function showAgeAnalysis() {
    // This function could create age-based visualizations
    console.log('Age analysis feature - to be implemented');
}

// Keyboard shortcuts for interaction
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'r':
            // R key: Load random subject
            document.getElementById('subject-select').value = 'random';
            updateVisualization();
            break;
        case 't':
            // T key: Toggle time scale
            const timeScale = document.getElementById('time-scale');
            timeScale.value = timeScale.value === 'hours' ? 'minutes' : 'hours';
            updateVisualization();
            break;
        case 'f':
            // F key: Toggle condition filter
            const conditionFilter = document.getElementById('condition-filter');
            const options = ['all', 'placebo', 'medication'];
            const currentIndex = options.indexOf(conditionFilter.value);
            conditionFilter.value = options[(currentIndex + 1) % options.length];
            updateVisualization();
            break;
    }
});

// Add window resize handler for responsive design
window.addEventListener('resize', function() {
    if (currentData && currentData.data.hypnogram) {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(function() {
            createHypnogram(currentData.data.hypnogram);
        }, 250);
    }
});

// Export functions for potential external use
window.sleepVisualization = {
    updateVisualization,
    loadSleepData,
    compareConditions,
    showAgeAnalysis
};