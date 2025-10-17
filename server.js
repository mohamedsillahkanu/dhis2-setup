const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const RENDER_API_KEY = 'rnd_TVWH0kcDZ28crIgn2M3Ew9taAblF';
const RENDER_API_URL = 'https://api.render.com/v1';
const GITHUB_REPO = 'mohamedsillahkanu/dhis2-setup';

// Deploy using Blueprint
app.post('/api/deploy-blueprint', async (req, res) => {
    const { appName, dbPlan, servicePlan, region, postgresVersion } = req.body;

    try {
        console.log('Deploying using Blueprint for:', appName);
        
        const dbName = appName.replace(/-/g, '_');
        
        // Create Blueprint instance
        const blueprintResponse = await axios.post(`${RENDER_API_URL}/blueprints`, {
            repo: `https://github.com/${GITHUB_REPO}`,
            branch: 'main',
            envVars: [
                { key: 'APP_NAME', value: appName },
                { key: 'DATABASE_NAME', value: dbName },
                { key: 'DB_USER', value: `${dbName}_user` },
                { key: 'DB_PLAN', value: dbPlan },
                { key: 'SERVICE_PLAN', value: servicePlan },
                { key: 'REGION', value: region },
                { key: 'POSTGRES_VERSION', value: postgresVersion }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${RENDER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const blueprint = blueprintResponse.data;
        console.log('Blueprint created:', blueprint.id);

        // Find the service ID from blueprint
        const serviceId = blueprint.services?.[0]?.id || null;

        res.json({
            success: true,
            blueprintId: blueprint.id,
            serviceId: serviceId,
            url: `https://${appName}.onrender.com`
        });

    } catch (error) {
        console.error('Blueprint deployment error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
});

// Check deployment status
app.get('/api/status/:serviceId', async (req, res) => {
    try {
        const response = await axios.get(`${RENDER_API_URL}/services/${req.params.serviceId}`, {
            headers: {
                'Authorization': `Bearer ${RENDER_API_KEY}`
            }
        });

        const service = response.data;
        
        const isLive = service.serviceDetails && 
                       service.serviceDetails.url && 
                       service.suspended === false;

        res.json({
            success: true,
            status: isLive ? 'live' : 'deploying',
            url: service.serviceDetails?.url || null,
            suspended: service.suspended
        });

    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'DHIS2 Deploy Proxy is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ DHIS2 Deploy Proxy running on port ${PORT}`);
});
