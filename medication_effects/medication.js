// Medication Effects Scrollytelling Visualization
// Built with D3.js and Scrollama

// Data from your clinical study
const medicationData = {
    placebo: {
        sleep_efficiency: 78,
        wake_percentage: 22,
        light_sleep_percentage: 45,
        deep_sleep_percentage: 15,
        rem_percentage: 18,
        sample_size: 22
    },
    temazepam: {
        sleep_efficiency: 85,
        wake_percentage: 12,
        light_sleep_percentage: 48,
        deep_sleep_percentage: 18,
        rem_percentage: 22,
        sample_size: 22
    }
};


// Color palette
const colors = {
    placebo: '#e74c3c',
    temazepam: '#3498db',
    wake: '#e74c3c',
    light: '#87ceeb',
    deep: '#2c3e50',
    rem: '#9b59b6',
    background: '#f8f9fa'
};

// Main visualization class
class MedicationVisualization {
    constructor() {
        this.container = d3.select('#main-visualization');
        this.width = 600;
        this.height = 500;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        
        this.svg = this.container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        this.tooltip = this.createTooltip();
        this.currentStep = 'setup';
        
        this.initializeVisualization();
    }

    createTooltip() {
        return d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');
    }

    showTooltip(event, title, content) {
        this.tooltip
            .style('display', 'block')
            .html(`<div class="tooltip-title">${title}</div><div class="tooltip-content">${content}</div>`)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 8) + 'px');
    }

    hideTooltip() {
        this.tooltip.style('display', 'none');
    }

    initializeVisualization() {
        // Start with the setup visualization
        this.renderSetup();
    }

    // Step 1: Study Setup
    renderSetup() {
        this.svg.selectAll('*').remove();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Title
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Clinical Trial Design');
        
        // Two groups representing placebo vs temazepam
        const groupData = [
            { label: 'Placebo Night', x: centerX - 120, color: colors.placebo },
            { label: 'Temazepam Night', x: centerX + 120, color: colors.temazepam }
        ];
        
        const groups = this.svg.selectAll('.study-group')
            .data(groupData)
            .enter()
            .append('g')
            .attr('class', 'study-group');
        
        // Circles representing study groups
        groups.append('circle')
            .attr('cx', d => d.x)
            .attr('cy', centerY)
            .attr('r', 80)
            .attr('fill', d => d.color)
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('mouseenter', (event, d) => {
                this.showTooltip(event, d.label, '22 participants monitored with polysomnography');
            })
            .on('mouseleave', () => this.hideTooltip());
        
        // Labels
        groups.append('text')
            .attr('x', d => d.x)
            .attr('y', centerY + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .text(d => d.label);
        
        // Sample size
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 150)
            .attr('text-anchor', 'middle')
            .attr('fill', '#7f8c8d')
            .attr('font-size', '16px')
            .text('22 participants • Crossover design • Polysomnography monitoring');
    }

    // Step 2: Sleep Efficiency Comparison
    renderEfficiency() {
        this.svg.selectAll('*').remove();
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        const data = [
            { condition: 'Placebo', value: medicationData.placebo.sleep_efficiency, color: colors.placebo },
            { condition: 'Temazepam', value: medicationData.temazepam.sleep_efficiency, color: colors.temazepam }
        ];
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Sleep Efficiency Comparison');
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        const x = d3.scaleBand()
            .domain(data.map(d => d.condition))
            .range([0, chartWidth])
            .padding(0.4);
        
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);
        
        // Bars
        const bars = g.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.condition))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => chartHeight - y(d.value))
            .attr('fill', d => d.color)
            .attr('rx', 4)
            .style('cursor', 'pointer');
        
        // Add tooltips
        bars.on('mouseenter', (event, d) => {
            const improvement = d.condition === 'Temazepam' ? 
                `+${medicationData.temazepam.sleep_efficiency - medicationData.placebo.sleep_efficiency}% improvement` : 
                'Baseline measurement';
            this.showTooltip(event, `${d.condition}: ${d.value}%`, improvement);
        })
        .on('mouseleave', () => this.hideTooltip());
        
        // Value labels
        g.selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.condition) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 10)
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('font-size', '18px')
            .text(d => `${d.value}%`);
        
        // Axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x));
        
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        
        // Y-axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + 15)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#7f8c8d')
            .text('Sleep Efficiency (%)');
    }

    // Step 3: Wake Time Reduction
    renderWakeTime() {
        this.svg.selectAll('*').remove();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = 100;
        
        // Title
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Wake Time Reduction');
        
        // Create pie charts for placebo and temazepam
        const pieData = [
            {
                label: 'Placebo',
                data: [
                    { stage: 'Awake', value: medicationData.placebo.wake_percentage, color: colors.wake },
                    { stage: 'Asleep', value: 100 - medicationData.placebo.wake_percentage, color: '#95a5a6' }
                ],
                x: centerX - 150
            },
            {
                label: 'Temazepam',
                data: [
                    { stage: 'Awake', value: medicationData.temazepam.wake_percentage, color: colors.wake },
                    { stage: 'Asleep', value: 100 - medicationData.temazepam.wake_percentage, color: colors.temazepam }
                ],
                x: centerX + 150
            }
        ];
        
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(40).outerRadius(radius);
        
        pieData.forEach(chart => {
            const g = this.svg.append('g')
                .attr('transform', `translate(${chart.x}, ${centerY})`);
            
            const arcs = g.selectAll('.arc')
                .data(pie(chart.data))
                .enter()
                .append('g')
                .attr('class', 'arc');
            
            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => d.data.color)
                .style('cursor', 'pointer')
                .on('mouseenter', (event, d) => {
                    this.showTooltip(event, `${chart.label} - ${d.data.stage}`, `${d.data.value.toFixed(1)}% of night`);
                })
                .on('mouseleave', () => this.hideTooltip());
            
            // Center label
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .text(chart.label);
            
            // Wake percentage
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.5em')
                .attr('font-size', '18px')
                .attr('fill', colors.wake)
                .attr('font-weight', 'bold')
                .text(`${chart.data[0].value}%`);
            
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '2.7em')
                .attr('font-size', '12px')
                .attr('fill', '#7f8c8d')
                .text('awake');
        });
        
        // Improvement indicator
        const improvement = ((medicationData.placebo.wake_percentage - medicationData.temazepam.wake_percentage) / medicationData.placebo.wake_percentage * 100).toFixed(0);
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + radius + 60)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', colors.temazepam)
            .attr('font-weight', 'bold')
            .text(`${improvement}% reduction in wake time`);
    }

    // Step 4: REM Sleep Enhancement
    renderREMSleep() {
        this.svg.selectAll('*').remove();
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('REM Sleep Enhancement');
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        // Create brain wave visualization for REM sleep
        const data = [
            { condition: 'Placebo', rem: medicationData.placebo.rem_percentage, x: chartWidth * 0.25 },
            { condition: 'Temazepam', rem: medicationData.temazepam.rem_percentage, x: chartWidth * 0.75 }
        ];
        
        data.forEach((d, i) => {
            // Brain icon representation
            const brainG = g.append('g')
                .attr('transform', `translate(${d.x}, ${chartHeight / 2})`);
            
            // Brain outline
            brainG.append('ellipse')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('rx', 60)
                .attr('ry', 45)
                .attr('fill', i === 0 ? colors.placebo : colors.temazepam)
                .attr('opacity', 0.3)
                .style('cursor', 'pointer')
                .on('mouseenter', (event) => {
                    this.showTooltip(event, `${d.condition} REM Sleep`, `${d.rem}% of total sleep time`);
                })
                .on('mouseleave', () => this.hideTooltip());
            
            // REM activity lines (representing brain activity)
            const numLines = Math.floor(d.rem / 2);
            for (let j = 0; j < numLines; j++) {
                const lineData = [];
                const points = 20;
                for (let k = 0; k < points; k++) {
                    lineData.push({
                        x: (k / points) * 80 - 40,
                        y: Math.sin(k * 0.5 + j) * (10 + j * 2)
                    });
                }
                
                const line = d3.line()
                    .x(d => d.x)
                    .y(d => d.y)
                    .curve(d3.curveCardinal);
                
                brainG.append('path')
                    .datum(lineData)
                    .attr('d', line)
                    .attr('stroke', colors.rem)
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('opacity', 0.7);
            }
            
            // Label
            brainG.append('text')
                .attr('y', 70)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .text(d.condition);
            
            // REM percentage
            brainG.append('text')
                .attr('y', 90)
                .attr('text-anchor', 'middle')
                .attr('font-size', '18px')
                .attr('fill', colors.rem)
                .attr('font-weight', 'bold')
                .text(`${d.rem}% REM`);
        });
    }

    // Step 5: Deep Sleep Patterns
    renderDeepSleep() {
        this.svg.selectAll('*').remove();
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Deep Sleep Preservation');
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        // Sleep depth visualization
        const data = [
            { condition: 'Placebo', deep: medicationData.placebo.deep_sleep_percentage },
            { condition: 'Temazepam', deep: medicationData.temazepam.deep_sleep_percentage }
        ];
        
        const x = d3.scaleBand()
            .domain(data.map(d => d.condition))
            .range([0, chartWidth])
            .padding(0.3);
        
        const y = d3.scaleLinear()
            .domain([0, 25])
            .range([chartHeight, 0]);
        
        // Create water-level style visualization for deep sleep
        data.forEach((d, i) => {
            const barG = g.append('g');
            
            // Container (outline)
            barG.append('rect')
                .attr('x', x(d.condition))
                .attr('y', y(25))
                .attr('width', x.bandwidth())
                .attr('height', chartHeight - y(25))
                .attr('fill', 'none')
                .attr('stroke', '#bdc3c7')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            
            // Deep sleep "water level"
            barG.append('rect')
                .attr('x', x(d.condition) + 2)
                .attr('y', y(d.deep))
                .attr('width', x.bandwidth() - 4)
                .attr('height', chartHeight - y(d.deep) - 2)
                .attr('fill', colors.deep)
                .attr('opacity', 0.8)
                .attr('rx', 6)
                .style('cursor', 'pointer')
                .on('mouseenter', (event) => {
                    this.showTooltip(event, `${d.condition} Deep Sleep`, `${d.deep}% of total sleep time`);
                })
                .on('mouseleave', () => this.hideTooltip());
            
            // Percentage label
            barG.append('text')
                .attr('x', x(d.condition) + x.bandwidth() / 2)
                .attr('y', y(d.deep) - 10)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '16px')
                .attr('fill', colors.deep)
                .text(`${d.deep}%`);
            
            // Condition label
            barG.append('text')
                .attr('x', x(d.condition) + x.bandwidth() / 2)
                .attr('y', chartHeight + 30)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .text(d.condition);
        });
        
        // Y-axis
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        
        // Y-axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + 15)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#7f8c8d')
            .text('Deep Sleep (%)');
    }

    // Step 6: Complete Sleep Architecture
    renderArchitecture() {
        this.svg.selectAll('*').remove();
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Complete Sleep Architecture');
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        // Stacked bar chart showing complete sleep composition
        const stages = ['wake_percentage', 'light_sleep_percentage', 'deep_sleep_percentage', 'rem_percentage'];
        const stageLabels = ['Wake', 'Light Sleep', 'Deep Sleep', 'REM Sleep'];
        const stageColors = [colors.wake, colors.light, colors.deep, colors.rem];
        
        const conditions = ['placebo', 'temazepam'];
        const conditionLabels = ['Placebo', 'Temazepam'];
        
        // Prepare stacked data
        const stackedData = conditions.map(condition => {
            const conditionData = medicationData[condition];
            let cumulative = 0;
            return stages.map((stage, i) => {
                const value = conditionData[stage];
                const result = {
                    condition: condition,
                    stage: stageLabels[i],
                    value: value,
                    y0: cumulative,
                    y1: cumulative + value,
                    color: stageColors[i]
                };
                cumulative += value;
                return result;
            });
        });
        
        const x = d3.scaleBand()
            .domain(conditionLabels)
            .range([0, chartWidth])
            .padding(0.3);
        
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);
        
        // Create stacked bars
        conditions.forEach((condition, conditionIndex) => {
            const barData = stackedData[conditionIndex];
            
            barData.forEach(d => {
                g.append('rect')
                    .attr('x', x(conditionLabels[conditionIndex]))
                    .attr('y', y(d.y1))
                    .attr('width', x.bandwidth())
                    .attr('height', y(d.y0) - y(d.y1))
                    .attr('fill', d.color)
                    .attr('opacity', 0.8)
                    .style('cursor', 'pointer')
                    .on('mouseenter', (event) => {
                        this.showTooltip(event, `${conditionLabels[conditionIndex]} - ${d.stage}`, `${d.value}% of total sleep time`);
                    })
                    .on('mouseleave', () => this.hideTooltip());
            });
        });
        
        // Axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x));
        
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        
        // Legend
        const legend = this.svg.append('g')
            .attr('transform', `translate(${this.width - 150}, 60)`);
        
        stageLabels.forEach((stage, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);
            
            legendItem.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', stageColors[i]);
            
            legendItem.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .attr('font-size', '12px')
                .text(stage);
        });
    }

    // Step 7: Individual Differences
    renderIndividual() {
        this.svg.selectAll('*').remove();
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Individual Response Variability');
        
        const rawData = {
            "0": { "subject_id": 5.0, "age": 32.0, "efficiency_diff": 3.4658544649, "baseline": 89.264990 },
            "1": { "subject_id": 6.0, "age": 35.0, "efficiency_diff": -0.6010737628, "baseline": 95.138889 },
            "2": { "subject_id": 7.0, "age": 51.0, "efficiency_diff": 14.0996918326, "baseline": 59.561510 },
            "3": { "subject_id": 8.0, "age": 66.0, "efficiency_diff": -0.4183156962, "baseline": 83.458647 },
            "4": { "subject_id": 9.0, "age": 47.0, "efficiency_diff": 6.8222369538, "baseline": 78.331528 },
            "5": { "subject_id": 10.0, "age": 20.0, "efficiency_diff": 6.9597320694, "baseline": 87.428023 },
            "6": { "subject_id": 11.0, "age": 21.0, "efficiency_diff": 0.5854461878, "baseline": 94.989775 },
            "7": { "subject_id": 12.0, "age": 21.0, "efficiency_diff": -2.701197438, "baseline": 93.177388 },
            "8": { "subject_id": 13.0, "age": 22.0, "efficiency_diff": 4.9467936841, "baseline": 92.957746 },
            "9": { "subject_id": 14.0, "age": 20.0, "efficiency_diff": 1.0024912087, "baseline": 94.988345 },
            "10": { "subject_id": 15.0, "age": 66.0, "efficiency_diff": 6.2353512239, "baseline": 88.405797 },
            "11": { "subject_id": 16.0, "age": 79.0, "efficiency_diff": 4.2605877914, "baseline": 84.008097 },
            "12": { "subject_id": 17.0, "age": 48.0, "efficiency_diff": 9.4037845466, "baseline": 76.580311 },
            "13": { "subject_id": 18.0, "age": 53.0, "efficiency_diff": -6.5047506182, "baseline": 95.243020 },
            "14": { "subject_id": 19.0, "age": 28.0, "efficiency_diff": -5.1789158761, "baseline": 97.744361 },
            "15": { "subject_id": 20.0, "age": 24.0, "efficiency_diff": -0.4947122794, "baseline": 98.156182 },
            "16": { "subject_id": 21.0, "age": 34.0, "efficiency_diff": -0.6237531831, "baseline": 84.653465 },
            "17": { "subject_id": 22.0, "age": 56.0, "efficiency_diff": 5.6796585446, "baseline": 85.382381 }
            };


            const participants = Object.values(rawData).map(d => ({
                id: d.subject_id,
                improvement: d.efficiency_diff,
                age: d.age,
                baseline: d.baseline // If not applicable, or you can calculate if needed
            }));
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        const x = d3.scaleLinear()
            .domain([18, 70])
            .range([0, chartWidth]);
        
        const y = d3.scaleLinear()
            .domain([-10, 20])
            .range([chartHeight, 0]);
        
        // Scatter plot
        g.selectAll('.participant-dot')
            .data(participants)
            .enter()
            .append('circle')
            .attr('class', 'participant-dot')
            .attr('cx', d => x(d.age))
            .attr('cy', d => y(d.improvement))
            .attr('r', 5)
            .attr('fill', d => d.improvement > 0 ? colors.temazepam : colors.placebo)
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('mouseenter', (event, d) => {
                this.showTooltip(event, `Participant ${d.id}`, 
                    `Age: ${Math.round(d.age)}<br>Improvement: ${d.improvement.toFixed(1)}%<br>Baseline: ${d.baseline.toFixed(1)}%`);
            })
            .on('mouseleave', () => this.hideTooltip());
        
        // Zero line
        g.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', y(0))
            .attr('y2', y(0))
            .attr('stroke', '#bdc3c7')
            .attr('stroke-dasharray', '5,5');
        
        // Axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x));
        
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        
        // Axis labels
        g.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', chartHeight + 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#7f8c8d')
            .text('Age (years)');
        
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + 15)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#7f8c8d')
            .text('Sleep Efficiency Improvement (%)');
    }

    // Step 8: Conclusion
    renderConclusion() {
        this.svg.selectAll('*').remove();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Title
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text('Treatment Impact Summary');
        
        // Key metrics in a circular layout
        const metrics = [
            { label: 'Sleep Efficiency', value: '+7%', angle: 0, color: colors.temazepam },
            { label: 'Wake Time', value: '-45%', angle: 120, color: colors.wake },
            { label: 'REM Sleep', value: '+22%', angle: 240, color: colors.rem }
        ];
        
        const radius = 120;
        
        metrics.forEach((metric, i) => {
            const angle = (metric.angle * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Metric circle
            this.svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 50)
                .attr('fill', metric.color)
                .attr('opacity', 0.2)
                .style('cursor', 'pointer')
                .on('mouseenter', (event) => {
                    this.showTooltip(event, metric.label, 
                        `${metric.value} improvement with temazepam vs placebo`);
                })
                .on('mouseleave', () => this.hideTooltip());
            
            // Value text
            this.svg.append('text')
                .attr('x', x)
                .attr('y', y - 5)
                .attr('text-anchor', 'middle')
                .attr('font-size', '20px')
                .attr('font-weight', 'bold')
                .attr('fill', metric.color)
                .text(metric.value);
            
            // Label text
            this.svg.append('text')
                .attr('x', x)
                .attr('y', y + 15)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#7f8c8d')
                .text(metric.label);
        });
        
        // Central message
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#2c3e50')
            .text('Significant');
        
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#2c3e50')
            .text('Improvements');
    }

    // Method to update visualization based on step
    updateVisualization(step) {
        this.currentStep = step;
        
        switch(step) {
            case 'setup':
                this.renderSetup();
                break;
            case 'efficiency':
                this.renderEfficiency();
                break;
            case 'wake-time':
                this.renderWakeTime();
                break;
            case 'rem-sleep':
                this.renderREMSleep();
                break;
            case 'deep-sleep':
                this.renderDeepSleep();
                break;
            case 'architecture':
                this.renderArchitecture();
                break;
            case 'individual':
                this.renderIndividual();
                break;
            case 'conclusion':
                this.renderConclusion();
                break;
            default:
                this.renderSetup();
        }
    }
}

// Scrollytelling controller
class ScrollytellingController {
    constructor() {
        this.visualization = new MedicationVisualization();
        this.initializeScrollama();
    }

    initializeScrollama() {
        // Initialize scrollama
        const scroller = scrollama();
        
        scroller
            .setup({
                step: '.step',
                offset: 0.5,
                debug: false
            })
            .onStepEnter(response => {
                // Update visualization based on step
                const step = response.element.getAttribute('data-step');
                this.visualization.updateVisualization(step);
                
                // Update step appearance
                document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
                response.element.classList.add('is-active');
            });

        // Handle resize
        window.addEventListener('resize', scroller.resize);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ScrollytellingController();
});