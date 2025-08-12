# China University Selection Calculator

A comprehensive web-based university recommendation tool for international students choosing Chinese universities. This interactive questionnaire matches students with suitable universities based on their preferences and profile.

## 🌟 Features

### Core Functionality
- **Interactive 7-Step Quiz**: Collects user preferences through an engaging questionnaire
- **Smart Matching Algorithm**: Matches users with top universities based on multiple criteria
- **Free Access**: All results are completely free to access
- **Mobile Responsive**: Works seamlessly on all devices
- **Donation Support**: Optional PayPal donation to support the project

### Quiz Questions
1. **Field of Study**: Engineering, Business, Medicine, Arts, Sciences, Social Sciences
2. **Academic Level**: Undergraduate or Graduate
3. **Budget Range**: Low ($2K-5K), Medium ($5K-10K), High ($10K+)
4. **City Size**: Mega City, Large City, Medium City
5. **University Ranking**: Very Important, Important, Moderate
6. **English Programs**: English Only, Both Languages, Chinese Programs
7. **Chinese Language Level**: None, Basic, Intermediate, Advanced

### Matching Criteria
- Field of study compatibility (25 points)
- Academic level programs (15 points)
- Budget compatibility (20 points)
- City size preference (15 points)
- University ranking (15 points)
- English program availability (10 points)
- Chinese language requirements (10 points)

## 🏛️ University Database

The tool includes 15 top Chinese universities with detailed information:

### Top Tier Universities
- **Tsinghua University** (Rank #16) - Engineering & Technology
- **Peking University** (Rank #18) - Humanities & Social Sciences
- **Fudan University** (Rank #34) - Medicine & Business
- **Shanghai Jiao Tong University** (Rank #47) - Engineering & Medicine
- **Zhejiang University** (Rank #53) - Comprehensive

### Other Notable Universities
- Nanjing University, Wuhan University, Xi'an Jiaotong University
- Sichuan University, Ocean University of China
- Beijing Normal University, Tongji University
- Sun Yat-sen University, Huazhong University of Science and Technology
- Nankai University

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- Local web server (for development)
- PayPal Business account (for production)

### Installation

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   cd china-university-selector
   ```

2. **Setup Local Server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in Browser**
   ```
   http://localhost:8000
   ```

### PayPal Donation Setup

1. **Get PayPal Client ID**
   - Sign up for a PayPal Business account
   - Go to PayPal Developer Dashboard
   - Create a new app to get your Client ID

2. **Update Client ID**
   - Open `index.html`
   - Replace `YOUR_PAYPAL_CLIENT_ID` with your actual Client ID
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD"></script>
   ```

3. **Customize Donation Amount**
   - Edit `script.js` to change the suggested donation amount
   - Currently set to $5, but you can modify as needed

## 📁 Project Structure

```
china-university-selector/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── universities.json   # University database
├── README.md           # This file
└── templates/          # Template directory (if needed)
```

## 🎨 Customization

### Adding Universities
Edit `universities.json` to add new universities:

```json
{
  "id": 16,
  "name": "New University",
  "abbreviation": "NU",
  "city": "City Name",
  "citySize": "large",
  "globalRanking": 500,
  "fields": ["engineering", "business"],
  "programs": {
    "undergraduate": {
      "engineering": { "tuition": 7000, "englishPrograms": true, "chineseRequired": false }
    }
  },
  "description": "University description",
  "website": "https://university.edu.cn",
  "scholarships": ["Scholarship Name"],
  "applicationDeadline": "March 31",
  "acceptanceRate": 0.25
}
```

### Modifying Quiz Questions
Edit the quiz steps in `index.html` and update the matching logic in `script.js`.

### Styling Changes
Modify `styles.css` to customize the appearance and branding.

## 🌐 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Custom Domain
1. Add custom domain in GitHub Pages settings
2. Update DNS records to point to GitHub Pages
3. Add `CNAME` file to repository root with your domain

### Other Hosting Options
- **Netlify**: Drag and drop the folder to deploy
- **Vercel**: Connect GitHub repository for automatic deployment
- **AWS S3**: Upload files to S3 bucket with static website hosting
- **Traditional Web Hosting**: Upload files via FTP

## 🔧 Configuration

### Environment Variables
For production, consider using environment variables for:
- PayPal Client ID
- Analytics tracking codes
- API endpoints

### Security Considerations
- Use HTTPS in production
- Validate PayPal payments server-side
- Implement rate limiting for quiz submissions
- Add CSRF protection for forms

## 📊 Analytics & Tracking

Add Google Analytics or other tracking:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Troubleshooting

### Common Issues

1. **Universities not loading**
   - Check if `universities.json` is accessible
   - Verify JSON syntax is valid
   - Check browser console for errors

2. **PayPal not working**
   - Verify Client ID is correct
   - Check if PayPal SDK is loading
   - Test in production environment (PayPal requires HTTPS)

3. **Mobile responsiveness issues**
   - Test on various devices
   - Check CSS media queries
   - Verify viewport meta tag

4. **Quiz not progressing**
   - Check JavaScript console for errors
   - Verify all option cards have `data-value` attributes
   - Ensure event listeners are properly attached

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For support or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting section above

## 🎯 Roadmap

Future enhancements:
- [ ] Add more universities to database
- [ ] Implement user accounts and saved results
- [ ] Add detailed university profiles
- [ ] Include student testimonials
- [ ] Add application tracking features
- [ ] Implement multi-language support
- [ ] Add comparison tools
- [ ] Include scholarship matching

---

**Built with ❤️ for international students pursuing education in China**
