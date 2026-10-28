const express = require('express');
const router = express.Router();
const localDb = require('../utils/localDb');
const translationService = require('../utils/translation');

// Get all services
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const servicesData = localDb.getServices();

    const services = await Promise.all(
      Object.keys(servicesData).map(async (key) => {
        const item = servicesData[key];
        let data = item[lang];

        if (!data) {
          const enData = item['en'] || {};
          if (lang === 'en') {
            data = enData;
          } else {
            try {
              const transName = await translationService.translateText(enData.name || key, lang, 'en');
              const transDesc = await translationService.translateText(enData.description || '', lang, 'en');
              data = {
                ...enData,
                name: transName.translatedText || enData.name,
                description: transDesc.translatedText || enData.description,
              };
            } catch {
              data = enData;
            }
          }
        }

        return {
          id: key,
          category: item.category || 'General',
          badgeColor: item.badgeColor || '#a3ff00',
          officialPortalUrl: item.officialPortalUrl || item.officialPortal || 'https://services.india.gov.in',
          ...data,
        };
      })
    );

    res.json({ services });
  } catch (error) {
    console.error('Services route error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get user applications (stored locally)
router.get('/applications', (req, res) => {
  try {
    const { phone } = req.query;
    const applications = localDb.getApplications(phone);
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Submit a service application (stored locally)
router.post('/apply', (req, res) => {
  try {
    const { serviceId, serviceName, applicantName, phone, aadhaarLast4, district } = req.body;

    if (!applicantName || !phone || !serviceId) {
      return res.status(400).json({ error: 'Name, phone number, and service ID are required' });
    }

    const application = localDb.saveApplication({
      serviceId,
      serviceName: serviceName || serviceId,
      applicantName,
      phone,
      aadhaarLast4: aadhaarLast4 || 'XXXX',
      district: district || 'Not Specified',
      status: 'Submitted',
      statusColor: '#a3ff00',
    });

    res.json({
      success: true,
      message: 'Application submitted successfully and stored in local records.',
      application,
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get specific service detail
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { lang = 'en' } = req.query;

    const item = localDb.getServiceById(serviceId);
    if (!item) {
      return res.status(404).json({ error: 'Service not found' });
    }

    let serviceData = item[lang];
    if (!serviceData) {
      const enData = item['en'] || {};
      if (lang === 'en') {
        serviceData = enData;
      } else {
        try {
          const transName = await translationService.translateText(enData.name || serviceId, lang, 'en');
          const transDesc = await translationService.translateText(enData.description || '', lang, 'en');
          const transSteps = await Promise.all(
            (enData.steps || []).map((s) => translationService.translateText(s, lang, 'en'))
          );
          serviceData = {
            ...enData,
            name: transName.translatedText || enData.name,
            description: transDesc.translatedText || enData.description,
            steps: transSteps.map((t) => t.translatedText),
          };
        } catch {
          serviceData = enData;
        }
      }
    }

    res.json({
      id: serviceId,
      category: item.category || 'General',
      badgeColor: item.badgeColor || '#a3ff00',
      ...serviceData,
    });
  } catch (error) {
    console.error('Service detail error:', error);
    res.status(500).json({ error: 'Failed to fetch service details' });
  }
});

module.exports = router;
