Vue.createApp({
    data() {
        return {
            date: '',
            name: '',
            closing_price: '',
            items: [],
            chart: null,
            startDate: '',
            endDate: '',
            highPrice: null,
            lowPrice: null
        }
    },
    methods: {
        async insert() {
            const res = await fetch('/api/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: this.date,
                    name: this.name,
                    closing_price: this.closing_price
                })
            });
            const data = await res.json();
            console.log(data);
        },

        async fetchData(name) {
            let query = `name=${name}`;
            if (this.startDate) {
                query += `&startDate=${this.startDate}`;
            }
            if (this.endDate) {
                query += `&endDate=${this.endDate}`;
            }

            const res = await fetch(`/api/future?${query}`);
            if (res.ok) {
                const data = await res.json();
                this.items = data;
                this.calculateHighLowPrices();
                this.updateChart();
            } else {
                console.error('Failed to fetch data:', res.statusText);
            }
        },

        calculateHighLowPrices() {
            if (this.items.length === 0) {
                this.highPrice = null;
                this.lowPrice = null;
                return;
            }

            this.highPrice = this.items.reduce((max, item) =>
                parseFloat(item.closing_price.replace(/,/g, '')) > parseFloat(max.closing_price.replace(/,/g, '')) ? item : max
            );

            this.lowPrice = this.items.reduce((min, item) =>
                parseFloat(item.closing_price.replace(/,/g, '')) < parseFloat(min.closing_price.replace(/,/g, '')) ? item : min
            );
        },

        updateChart() {
            const ctx = document.getElementById('myChart').getContext('2d');
            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.items.map(item => item.date),
                    datasets: [{
                        label: '收盤價',
                        data: this.items.map(item => parseFloat(item.closing_price.replace(/,/g, ''))),
                        borderColor: 'rgba(27, 38, 58, 1)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: {
                            beginAtZero: true
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}).mount('#app');
