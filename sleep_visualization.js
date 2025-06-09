const sleepData = {
    ageGroups: {
        "18-30": { sleep_efficiency: 85, rem_percentage: 22, deep_sleep_percentage: 18, sample_size: 15 },
        "31-50": { sleep_efficiency: 82, rem_percentage: 20, deep_sleep_percentage: 16, sample_size: 12 },
        "51-70": { sleep_efficiency: 78, rem_percentage: 18, deep_sleep_percentage: 14, sample_size: 10 },
        "70+": { sleep_efficiency: 75, rem_percentage: 16, deep_sleep_percentage: 12, sample_size: 3 }
    },
    genderGroups: {
        "M": { sleep_efficiency: 80, rem_percentage: 19, deep_sleep_percentage: 15, sample_size: 13 },
        "F": { sleep_efficiency: 83, rem_percentage: 21, deep_sleep_percentage: 16, sample_size: 27 }
    }
};

const colors = {
    primary: '#3498db',
    secondary: '#2c3e50',
    wake: '#e6e600',
    light: '#3498db',
    deep: '#2c3e50',
    rem: '#9b59b6',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c'
};

class Tooltip {
    constructor() {
        this.tooltip = document.getElementById('tooltip');
        this.titleElement = document.getElementById('tooltip-title');
        this.contentElement = document.getElementById('tooltip-content');
    }

    show(event, title, content) {
        this.titleElement.textContent = title;
        this.contentElement.innerHTML = content;
        
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (event.pageX + 12) + 'px';
        this.tooltip.style.top = (event.pageY - 8) + 'px';
    }

    hide() {
        this.tooltip.style.display = 'none';
    }

    move(event) {
        if (this.tooltip.style.display === 'block') {
            this.tooltip.style.left = (event.pageX + 12) + 'px';
            this.tooltip.style.top = (event.pageY - 8) + 'px';
        }
    }
}

const tooltip = new Tooltip();

class SliderManager {
    constructor() {
        this.sliders = ['wake', 'light', 'deep', 'rem'];
        this.initialize();
    }

    initialize() {
        this.sliders.forEach(stage => {
            const slider = document.getElementById(`${stage}-slider`);
            const valueDisplay = document.getElementById(`${stage}-value`);
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value + '%';
                this.normalizeSliders(stage);
            });

            slider.addEventListener('mouseenter', (event) => {
                const descriptions = {
                    'wake': 'Time spent awake during the night.<br>Lower percentages indicate better sleep continuity.',
                    'light': 'Stages N1 and N2 of NREM sleep.<br>Important for sleep maintenance and restoration.',
                    'deep': 'Stage N3 of NREM sleep.<br>Critical for physical recovery and memory consolidation.',
                    'rem': 'Rapid Eye Movement sleep.<br>Essential for cognitive function and emotional processing.'
                };
                tooltip.show(event, `${stage.charAt(0).toUpperCase() + stage.slice(1)} Sleep`, descriptions[stage]);
            });

            slider.addEventListener('mouseleave', () => {
                tooltip.hide();
            });

            slider.addEventListener('mousemove', (event) => {
                tooltip.move(event);
            });
        });
    }

    normalizeSliders(changedStage) {
        const values = {};
        let total = 0;
        
        this.sliders.forEach(stage => {
            values[stage] = parseInt(document.getElementById(`${stage}-slider`).value);
            total += values[stage];
        });

        if (total > 100) {
            const excess = total - 100;
            const otherStages = this.sliders.filter(s => s !== changedStage);
            const otherTotal = otherStages.reduce((sum, stage) => sum + values[stage], 0);
            
            if (otherTotal > 0) {
                otherStages.forEach(stage => {
                    const proportion = values[stage] / otherTotal;
                    const reduction = Math.floor(proportion * excess);
                    const newValue = Math.max(0, values[stage] - reduction);
                    
                    document.getElementById(`${stage}-slider`).value = newValue;
                    document.getElementById(`${stage}-value`).textContent = newValue + '%';
                });
            }
        }
    }

    getValues() {
        return {
            wake: parseInt(document.getElementById('wake-slider').value),
            light: parseInt(document.getElementById('light-slider').value),
            deep: parseInt(document.getElementById('deep-slider').value),
            rem: parseInt(document.getElementById('rem-slider').value)
        };
    }
}

class SleepCalculator {
    static calculateScore(userInput) {
        const { age, totalSleep, wake, light, deep, rem } = userInput;
        const sleepEfficiency = ((100 - wake) / 100) * 100;
        
        let idealRem, idealDeep, idealEfficiency;
        
        if (age < 30) {
            idealRem = 22; idealDeep = 18; idealEfficiency = 85;
        } else if (age < 50) {
            idealRem = 20; idealDeep = 16; idealEfficiency = 82;
        } else if (age < 70) {
            idealRem = 18; idealDeep = 14; idealEfficiency = 78;
        } else {
            idealRem = 16; idealDeep = 12; idealEfficiency = 75;
        }
        
        const efficiencyScore = Math.max(0, 100 - Math.abs(sleepEfficiency - idealEfficiency) * 2);
        const remScore = Math.max(0, 100 - Math.abs(rem - idealRem) * 3);
        const deepScore = Math.max(0, 100 - Math.abs(deep - idealDeep) * 3);
        
        const idealHours = 8;
        const durationScore = Math.max(0, 100 - Math.abs(totalSleep - idealHours) * 12);
        
        const totalScore = (
            efficiencyScore * 0.30 + 
            remScore * 0.25 + 
            deepScore * 0.25 + 
            durationScore * 0.20
        );
        
        return {
            total: Math.round(totalScore),
            efficiency: Math.round(sleepEfficiency),
            components: {
                efficiency: Math.round(efficiencyScore),
                rem: Math.round(remScore),
                deep: Math.round(deepScore),
                duration: Math.round(durationScore)
            }
        };
    }

    static getScoreColor(score) {
        if (score >= 80) return colors.success;
        if (score >= 60) return colors.warning;
        return colors.danger;
    }

    static getScoreDescription(score) {
        if (score >= 80) {
            return "Excellent sleep quality. Your sleep patterns are well-optimized for restoration and cognitive function.";
        } else if (score >= 60) {
            return "Good sleep quality with opportunities for improvement. Consider optimizing your sleep environment and habits.";
        } else {
            return "Sleep quality could be significantly improved. Focus on consistent sleep schedule and proper sleep hygiene.";
        }
    }
}

class ScoreGauge {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = 180;
        this.height = 180;
        this.radius = 70;
    }

    render(score) {
        this.container.selectAll("*").remove();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.container.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("stroke", "#ecf0f1")
            .attr("stroke-width", 12);
        
        const angle = (score / 100) * 2 * Math.PI;
        const color = SleepCalculator.getScoreColor(score);
        
        const arc = d3.arc()
            .innerRadius(this.radius - 6)
            .outerRadius(this.radius + 6)
            .startAngle(-Math.PI / 2)
            .endAngle(-Math.PI / 2 + angle);
        
        const arcPath = this.container.append("path")
            .attr("d", arc)
            .attr("transform", `translate(${centerX}, ${centerY})`)
            .attr("fill", color)
            .style("cursor", "pointer");

        arcPath.on("mouseenter", (event) => {
            const description = SleepCalculator.getScoreDescription(score);
            tooltip.show(event, `Sleep Quality Score: ${score}/100`, description);
        })
        .on("mouseleave", () => {
            tooltip.hide();
        })
        .on("mousemove", (event) => {
            tooltip.move(event);
        });
    }
}

class ComparisonChart {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.margin = { top: 20, right: 20, bottom: 50, left: 60 };
    }

    render(userValue, averageValue, label, unit = "%") {
        this.container.selectAll("*").remove();
        
        const containerElement = document.getElementById(this.container.attr("id")).parentElement;
        const width = containerElement.offsetWidth - 40;
        const height = 250;
        
        this.container.attr("width", width).attr("height", height);
        
        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;
        
        const data = [
            { category: "Your Result", value: userValue, type: "user" },
            { category: "Group Average", value: averageValue, type: "average" }
        ];
        
        const x = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.4);
        
        const y = d3.scaleLinear()
            .domain([0, Math.max(100, d3.max(data, d => d.value) * 1.1)])
            .range([chartHeight, 0]);
        
        const g = this.container.append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        
        // Create bars
        const bars = g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => chartHeight - y(d.value))
            .attr("fill", d => d.type === "user" ? colors.primary : "#bdc3c7")
            .attr("rx", 4);

        bars.on("mouseenter", (event, d) => {
            const comparison = d.type === "user" ? 
                (d.value > averageValue ? `${(d.value - averageValue).toFixed(1)}${unit} above average` : 
                 `${(averageValue - d.value).toFixed(1)}${unit} below average`) : 
                "Population average from research data";
            tooltip.show(event, `${d.category}: ${d.value.toFixed(1)}${unit}`, comparison);
        })
        .on("mouseleave", () => {
            tooltip.hide();
        })
        .on("mousemove", (event) => {
            tooltip.move(event);
        });
        
        g.selectAll(".bar-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 8)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .attr("fill", "#2c3e50")
            .text(d => `${d.value.toFixed(1)}${unit}`);
        
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x));
        
        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));
        
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 15)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#7f8c8d")
            .text(label);
    }
}

class HypnogramChart {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.margin = { top: 20, right: 20, bottom: 40, left: 80 };
    }

    render(userInput) {
        this.container.selectAll("*").remove();
        
        const containerElement = document.getElementById(this.container.attr("id")).parentElement;
        const width = containerElement.offsetWidth - 40;
        const height = 220;
        
        this.container.attr("width", width).attr("height", height);
        
        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;
        
        const sleepData = this.generateSleepPattern(userInput);
        
        const x = d3.scaleLinear()
            .domain([0, userInput.totalSleep * 60])
            .range([0, chartWidth]);
        
        const stageScale = d3.scaleOrdinal()
            .domain(['Wake', 'Light', 'Deep', 'REM'])
            .range([chartHeight - 20, chartHeight - 60, chartHeight - 100, chartHeight - 140]);
        
        const g = this.container.append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        
        const line = d3.line()
            .x(d => x(d.time))
            .y(d => stageScale(d.stage))
            .curve(d3.curveStepAfter);
        
        g.append("path")
            .datum(sleepData)
            .attr("class", "sleep-line")
            .attr("d", line);
        
        const dots = g.selectAll(".sleep-dot")
            .data(sleepData)
            .enter()
            .append("circle")
            .attr("class", "sleep-dot")
            .attr("cx", d => x(d.time))
            .attr("cy", d => stageScale(d.stage))
            .attr("r", 4)
            .attr("fill", d => this.getStageColor(d.stage));

        dots.on("mouseenter", (event, d) => {
            const timeStr = `${Math.floor(d.time / 60)}h ${Math.floor(d.time % 60)}m`;
            const durationStr = `${Math.floor(d.duration / 60)}h ${Math.floor(d.duration % 60)}m`;
            tooltip.show(event, `${d.stage} Sleep Period`, 
                `Start Time: ${timeStr}<br>Duration: ${durationStr}<br>Sleep Stage: ${d.stage}`);
        })
        .on("mouseleave", () => {
            tooltip.hide();
        })
        .on("mousemove", (event) => {
            tooltip.move(event);
        });
        
        const stages = ['Wake', 'Light', 'Deep', 'REM'];
        stages.forEach(stage => {
            g.append("text")
                .attr("x", -10)
                .attr("y", stageScale(stage) + 5)
                .attr("text-anchor", "end")
                .attr("font-size", "12px")
                .attr("font-weight", "500")
                .attr("fill", this.getStageColor(stage))
                .text(stage);
        });
        
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(x)
                .tickFormat(d => `${Math.floor(d / 60)}h`)
                .ticks(Math.max(4, userInput.totalSleep)));
        
        g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#7f8c8d")
            .text("Time (hours)");
    }

    generateSleepPattern(userInput) {
        const totalMinutes = userInput.totalSleep * 60;
        const pattern = [];
        let currentTime = 0;
        
        const cycleLength = 90; 
        const numCycles = Math.floor(totalMinutes / cycleLength);
        
        for (let cycle = 0; cycle < numCycles; cycle++) {
            const cycleStart = cycle * cycleLength;
            
            const stages = [
                { stage: 'Light', duration: 20 },
                { stage: 'Deep', duration: 30 },
                { stage: 'Light', duration: 25 },
                { stage: 'REM', duration: 15 }
            ];
            
            if (Math.random() < 0.3) {
                stages.splice(Math.floor(Math.random() * stages.length), 0, 
                    { stage: 'Wake', duration: 5 });
            }
            
            stages.forEach(({ stage, duration }) => {
                if (currentTime < totalMinutes) {
                    pattern.push({
                        time: currentTime,
                        stage: stage,
                        duration: Math.min(duration, totalMinutes - currentTime)
                    });
                    currentTime += duration;
                }
            });
        }
        
        return this.adjustPatternToPercentages(pattern, userInput, totalMinutes);
    }

    adjustPatternToPercentages(pattern, userInput, totalMinutes) {
        const stageCounts = { Wake: 0, Light: 0, Deep: 0, REM: 0 };
        pattern.forEach(p => stageCounts[p.stage]++);
        
        const total = pattern.length;
        const targetCounts = {
            Wake: Math.round((userInput.wake / 100) * total),
            Light: Math.round((userInput.light / 100) * total),
            Deep: Math.round((userInput.deep / 100) * total),
            REM: Math.round((userInput.rem / 100) * total)
        };
        const adjustedPattern = [...pattern];
        
        Object.keys(targetCounts).forEach(stage => {
            const current = stageCounts[stage];
            const target = targetCounts[stage];
            const diff = target - current;
            
            if (diff > 0) {
                for (let i = 0; i < Math.abs(diff) && i < adjustedPattern.length; i++) {
                    if (adjustedPattern[i].stage !== stage && Math.random() < 0.3) {
                        adjustedPattern[i].stage = stage;
                    }
                }
            }
        });
        
        return adjustedPattern;
    }

    getStageColor(stage) {
        const stageColors = {
            'Wake': colors.wake,
            'Light': colors.light,
            'Deep': colors.deep,
            'REM': colors.rem
        };
        return stageColors[stage] || colors.primary;
    }
}

class SleepAnalyzer {
    constructor() {
        this.sliderManager = new SliderManager();
        this.scoreGauge = new ScoreGauge('score-gauge');
        this.ageComparisonChart = new ComparisonChart('age-comparison');
        this.genderComparisonChart = new ComparisonChart('gender-comparison');
        this.hypnogramChart = new HypnogramChart('hypnogram');
        
        this.initialize();
    }

    initialize() {
        this.analyze();
    }

    getUserInput() {
        return {
            age: parseInt(document.getElementById('age').value) || 30,
            gender: document.getElementById('gender').value,
            totalSleep: parseFloat(document.getElementById('total-sleep').value) || 8,
            ...this.sliderManager.getValues()
        };
    }

    getAgeGroup(age) {
        if (age < 30) return "18-30";
        if (age < 50) return "31-50";
        if (age < 70) return "51-70";
        return "70+";
    }

    analyze() {
        const userInput = this.getUserInput();
        const sleepScore = SleepCalculator.calculateScore(userInput);
        
        this.scoreGauge.render(sleepScore.total);
        document.getElementById('score-text').textContent = sleepScore.total;
        document.getElementById('score-text').style.color = SleepCalculator.getScoreColor(sleepScore.total);
        document.getElementById('score-description').textContent = SleepCalculator.getScoreDescription(sleepScore.total);
        
        const ageGroup = this.getAgeGroup(userInput.age);
        const ageData = sleepData.ageGroups[ageGroup];
        const genderData = sleepData.genderGroups[userInput.gender];
        
        this.ageComparisonChart.render(
            sleepScore.efficiency, 
            ageData.sleep_efficiency, 
            "Sleep Efficiency (%)"
        );
        
        this.genderComparisonChart.render(
            userInput.rem, 
            genderData.rem_percentage, 
            "REM Sleep (%)"
        );
        
        document.getElementById('age-comparison-text').textContent = 
            `Average sleep efficiency for ages ${ageGroup}: ${ageData.sleep_efficiency}% (based on ${ageData.sample_size} subjects)`;
        
        document.getElementById('gender-comparison-text').textContent = 
            `Average REM sleep for ${userInput.gender === 'M' ? 'males' : 'females'}: ${genderData.rem_percentage}% (based on ${genderData.sample_size} subjects)`;
        
        this.hypnogramChart.render(userInput);
    }
}

function analyzeSleep() {
    if (window.sleepAnalyzer) {
        window.sleepAnalyzer.analyze();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.sleepAnalyzer = new SleepAnalyzer();
});