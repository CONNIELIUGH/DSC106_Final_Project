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
    wake: '#e6e600',
    light: '#87ceeb',
    deep: '#2c3e50',
    rem: '#9b59b6',
    background: '#f8f9fa',
    title: "#ffffff",
    subtitle: "#bdbfbf"
};

// Main visualization class
class MedicationVisualization {
    constructor() {
        this.containerInfo = document.getElementById("chart-container");
        this.container = d3.select('#main-visualization');
        this.width = this.containerInfo.clientWidth;
        this.height = this.containerInfo.clientHeight || this.width * 0.6;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        
        this.svg = this.container
            .append('svg')
            .attr("viewBox", [0,0, this.width, this.height])
            .attr("preserveAspectRation", "xMidYmid meet")
            .classed("responsive-svg", true);
        
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
        const titleY = 40;
        
        // Title
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', titleY)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .attr('fill', colors.title)
            .text('Clinical Trial Design');

        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', titleY + 25)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.subtitle)
            .attr('font-size', '13px')
            .text('NOTE: The same 22 participants are given a');

        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', titleY + 40)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.subtitle)
            .attr('font-size', '13px')
            .text('placebo one night and Temazepam another');
        
        // Two groups representing placebo vs temazepam
        const groupData = [
            { label: 'Placebo Night', x: centerX - 125, color: colors.placebo },
            { label: 'Temazepam Night', x: centerX + 125, color: colors.temazepam }
        ];
        
        const groups = this.svg.selectAll('.study-group')
            .data(groupData)
            .enter()
            .append('g')
            .attr('class', 'study-group');
        
        // Circles representing study groups
        const numParticipants = 22;
        const circleRadius = 10;
        const circleSpacing = 26;
        const columns = 6;
        const rows = Math.ceil(numParticipants / columns);

        // For each group, add 22 small circles
        groups.each(function (groupData) {
            const group = d3.select(this);
            const startX = groupData.x - (columns - 1) * circleSpacing / 2;
            const startY = centerY - (rows - 1) * circleSpacing / 2;

            const participants = d3.range(numParticipants);

            group.selectAll('circle')
                .data(participants)
                .enter()
                .append('circle')
                .attr('cx', d => startX + (d % columns) * circleSpacing)
                .attr('cy', d => startY + Math.floor(d / columns) * circleSpacing)
                .attr('r', circleRadius)
                .attr('fill', groupData.color)
                .attr('opacity', 0.8)
        });
        
        // Labels
        groups.append('text')
            .attr('x', d => d.x)
            .attr('y', centerY - 75)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '16px')
            .text(d => d.label);
        
        // Sample size
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 150)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.subtitle)
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
            .attr('fill', colors.title)
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
            .style('fill', colors.title)
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
            .style('fill', colors.subtitle)
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
            .style('fill', colors.title)
            .text('Wake Time Reduction');
        
        // Create pie charts for placebo and temazepam
        const pieData = [
            {
                label: 'Placebo',
                data: [
                    { stage: 'Awake', value: medicationData.placebo.wake_percentage, color: colors.wake },
                    { stage: 'Asleep', value: 100 - medicationData.placebo.wake_percentage, color: colors.subtitle }
                ],
                x: centerX - 150
            },
            {
                label: 'Temazepam',
                data: [
                    { stage: 'Awake', value: medicationData.temazepam.wake_percentage, color: colors.wake },
                    { stage: 'Asleep', value: 100 - medicationData.temazepam.wake_percentage, color: colors.subtitle }
                ],
                x: centerX + 150
            }
        ];
        
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(50).outerRadius(radius);
        
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
                .attr('dy', '-1em')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .style('fill', colors.title)
                .text(chart.label);
            
            // Wake percentage
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.5em')
                .attr('font-size', '18px')
                .attr('fill', colors.wake)
                .attr('font-weight', 'bold')
                .text(`${chart.data[0].value}%`);
            
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '2.0em')
                .attr('font-size', '12px')
                .attr('fill', colors.subtitle)
                .text('awake');
        });
        
        // Improvement indicator
        const improvement = ((medicationData.placebo.wake_percentage - medicationData.temazepam.wake_percentage) / medicationData.placebo.wake_percentage * 100).toFixed(0);
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + radius + 60)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', colors.wake)
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
            .style('fill', colors.title)
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
                .attr('y', 80)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '20px')
                .style('fill', colors.title)
                .text(d.condition);
            
            // REM percentage
            brainG.append('text')
                .attr('y', 110)
                .attr('text-anchor', 'middle')
                .attr('font-size', '19px')
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
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .style('fill', colors.title)
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
                .attr('fill', colors.title)
                .text(`${d.deep}%`);
            
            // Condition label
            barG.append('text')
                .attr('x', x(d.condition) + x.bandwidth() / 2)
                .attr('y', chartHeight + 30)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .attr('fill', i === 0 ? colors.placebo : colors.temazepam)
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
            .style('fill', colors.subtitle)
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
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .style('fill', colors.title)
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
            .attr('transform', `translate(${this.width - 80}, 60)`);
        
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
                .style('fill', colors.subtitle)
                .text(stage);
        });
    }

    // Step 7: Individual Differences
    renderIndividual() {
        this.svg.selectAll('*').remove();
        
        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .style('fill', colors.title)
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


            const participants = Object.values(rawData)
            .map(d => ({
                id: d.subject_id,
                outcome: d.baseline + d.efficiency_diff,
                age: d.age,
                baseline: d.baseline,
                change: d.efficiency_diff
            }))
            .sort((a, b) => a.age - b.age);
        
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        const x = d3.scaleLinear()
            .domain([18, 70])
            .range([0, chartWidth]);
        
        const y = d3.scaleLinear()
            .domain([59.5, 100])
            .range([chartHeight, 0]);
        
        // Scatter plot
        const circles = g.selectAll('.participant-dot')
            .data(participants)
            .enter()
            .append('circle')
            .attr('class', 'participant-dot')
            .attr('cx', d => x(d.age))
            .attr('cy', d => y(d.baseline))
            .attr('r', 5)
            //.attr('fill', d => d.improvement > 0 ? colors.temazepam : colors.placebo)
            .attr('fill', '#cccccc')
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('mouseenter', (event, d) => {
                this.showTooltip(event, `Participant ${d.id}`, 
                    `Age: ${Math.round(d.age)}<br>Improvement: ${Math.round(d.change)}%<br>Baseline: ${Math.round(d.baseline)}%`);
            })
            .on('mouseleave', () => this.hideTooltip());
                    
        // Zero line
        // g.append('line')
        //     .attr('x1', 0)
        //     .attr('x2', chartWidth)
        //     .attr('y1', y(0))
        //     .attr('y2', y(0))
        //     .attr('stroke', '#bdc3c7')
        //     .attr('stroke-dasharray', '5,5');
        
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
            .style('fill', colors.subtitle)
            .text('Age (years)');
        
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + 15)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', colors.subtitle)
            .text('Sleep Efficiency');
        
        function animateCircles() {
            circles.transition()
                .delay((d, i) => 500 + i * 120)
                .duration(1500)
                .attr('cx', d => x(d.age))
                .attr('cy', d => y(d.outcome))
                .attr('fill', d => d.change > 0 ? colors.temazepam : colors.placebo)
                .attr('r', d => d.change > 0 ? 7 : 5);
        }
        function resetAndAnimate() {
            // Reset circles to initial state
            circles
                .transition()
                .duration(0)
                .attr('cx', d => x(d.age))
                .attr('cy', d => y(d.baseline))
                .attr('fill', '#cccccc')
                .attr('r', 5);

            // Animate after a short delay
            setTimeout(animateCircles, 500);
        }

        
        circles
            .transition()
            .duration(0)
            .attr('cx', d => x(d.age))
            .attr('cy', d => y(d.baseline))
            .attr('fill', '#cccccc')
            .attr('r', 5);

        // Animate after a short delay (e.g., 1 second)
        setTimeout(animateCircles, 1000);

        setTimeout(resetAndAnimate, 15_000)
    }

    // step 8 change
    renderChange() {
        this.svg.selectAll('*').remove();

        const placeboBarColors = [
            '#e57373', // Wake (%) - strong red
            '#f8bbbd', // REM (%) - very light red/pink
            '#fde0dc'  // Stage 3 (%) - even lighter pink
        ];
        const temazepamBarColors = [
            '#42a5f5', // Wake (%) - strong blue
            '#b3e5fc', // REM (%) - very light blue
            '#e3f2fd'  // Stage 3 (%) - even lighter blue
        ];

        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;

        // New dataset
        const dataByCondition = {
            placebo: {
                "condition": "placebo",
                "W_pct": 14.900876,
                "R_pct": 16.928019,
                "3_pct": 9.588141
            },
            temazepam: {
                "condition": "temazepam",
                "W_pct": 9.557670,
                "R_pct": 18.916013,
                "3_pct": 11.095658
            }
        };

        const metrics = [
            { key: 'W_pct', label: 'Wake (%)' },
            { key: 'R_pct', label: 'REM (%)' },
            { key: '3_pct', label: 'Deep Sleep (%)' }
        ];

        // Prepare data for bar chart
        const chartDataPlacebo = metrics.map(m => ({
            label: m.label,
            value: dataByCondition.placebo[m.key]
        }));
        const chartDataTemazepam = metrics.map(m => ({
            label: m.label,
            value: dataByCondition.temazepam[m.key]
        }));

        // Title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .style('fill', colors.title)
            .text('Sleep Stage Percentages: Placebo → Temazepam');

        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        const x = d3.scaleBand()
            .domain(chartDataPlacebo.map(d => d.label))
            .range([0, chartWidth])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max([
                ...metrics.map(m => dataByCondition.placebo[m.key]),
                ...metrics.map(m => dataByCondition.temazepam[m.key])
            ]) * 1.1])
            .range([chartHeight, 0]);

        // Only use numeric values for color scale domains
        const placeboVals = metrics.map(m => dataByCondition.placebo[m.key]);
        const temazepamVals = metrics.map(m => dataByCondition.temazepam[m.key]);

        const placeboColorScale = d3.scaleLinear()
            .domain([d3.min(placeboVals), d3.max(placeboVals)])
            .range(['#fde0dc', '#e57373']); // light red to strong red

        const temazepamColorScale = d3.scaleLinear()
            .domain([d3.min(temazepamVals), d3.max(temazepamVals)])
            .range(['#e3f2fd', '#42a5f5']); // light blue to strong blue

        // Draw placebo bars
        const bars = g.selectAll('.bar')
            .data(chartDataPlacebo, d => d.label)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.label))
            .attr('width', x.bandwidth())
            .attr('y', d => y(d.value))
            .attr('height', d => chartHeight - y(d.value))
            .attr('fill', d => placeboColorScale(d.value));

        // Value labels
        const labels = g.selectAll('.bar-label')
            .data(chartDataPlacebo, d => d.label)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 8)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('fill', colors.subtitle)
            .text(d => d.value.toFixed(2));

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
            .style('fill', colors.subtitle)
            .text('Percentage (%)');

        // Animation logic
        function animateTransition() {
            // Animate to temazepam
            bars.data(chartDataTemazepam, d => d.label)
                .transition()
                .duration(3000)
                .attr('y', d => y(d.value))
                .attr('height', d => chartHeight - y(d.value))
                .attr('fill', d => temazepamColorScale(d.value));

            labels.data(chartDataTemazepam, d => d.label)
                .transition()
                .duration(3000)
                .attr('y', d => y(d.value) - 8)
                .tween('text', function(d) {
                    const i = d3.interpolateNumber(+this.textContent, d.value);
                    return function(t) {
                        this.textContent = i(t).toFixed(2);
                    };
                });

            // After 4 seconds, reset to placebo
            setTimeout(() => {
                bars.data(chartDataPlacebo, d => d.label)
                    .transition()
                    .duration(3000)
                    .attr('y', d => y(d.value))
                    .attr('height', d => chartHeight - y(d.value))
                    .attr('fill', d => placeboColorScale(d.value));

                labels.data(chartDataPlacebo, d => d.label)
                    .transition()
                    .duration(3000)
                    .attr('y', d => y(d.value) - 8)
                    .tween('text', function(d) {
                        const i = d3.interpolateNumber(+this.textContent, d.value);
                        return function(t) {
                            this.textContent = i(t).toFixed(2);
                        };
                    });

                // After 4s, repeat the animation (total cycle: 3+4+2+4=13s)
                setTimeout(animateTransition, 5000);
            }, 5000);
        }

        // Start the animation after 1 second
        setTimeout(animateTransition, 2000);
    }

    // Step 9: Conclusion
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
            .style('fill', colors.title)
            .text('Treatment Impact Summary');
        
        // Key metrics in a circular layout
        const metrics = [
            { label: 'Sleep Efficiency', value: '+7%', angle: 0, color: colors.temazepam, size: 7 },
            { label: 'Wake Time', value: '-45%', angle: 120, color: colors.wake, size: 45 },
            { label: 'REM Sleep', value: '+22%', angle: 240, color: colors.rem, size: 22 }
        ];
        
        const radius = 120;
        
        metrics.forEach((metric, i) => {
            const angle = (metric.angle * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            console.log(parseFloat(metric.value))
            
            // Metric circle
            this.svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 26 * Math.log(metric.size))
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
                .attr('font-size', '14px')
                .attr('fill', colors.subtitle)
                .text(metric.label);
        });
        
        // Central message
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('fill', colors.subtitle)
            .text('Significant');
        
        this.svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('fill', colors.subtitle)
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
            case 'change':
                this.renderChange();
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