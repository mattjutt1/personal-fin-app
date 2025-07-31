# Security Guidelines - Personal Finance App

> **Critical**: This is a financial application handling sensitive user data. Security is non-negotiable.

## 🔒 Secrets Management

### Environment Variables
- **NEVER** commit `.env`, `.env.local`, or any file containing real secrets
- **ALWAYS** use `.env.example` templates to show required variables
- **ALWAYS** add new secret variables to `.gitignore` patterns

### Secret File Patterns (Auto-Ignored)
```bash
# These patterns are automatically ignored:
*.key
*.pem
*secret*
*password*
*credential*
*private*
.env
.env.*
```

### Setting Up Environment Variables

#### Frontend (Next.js)
```bash
# Copy template
cp apps/frontend/.env.local.example apps/frontend/.env.local

# Edit with your values
nano apps/frontend/.env.local
```

#### Backend (Python)
```bash
# Copy template  
cp apps/backend/.env.example apps/backend/.env

# Edit with your values
nano apps/backend/.env
```

## 🛡️ Financial Data Security

### PII Protection Rules
1. **Never log sensitive data**
   - Account numbers
   - SSNs
   - Bank credentials
   - Transaction details with personal info

2. **Data at rest encryption**
   - All financial data must be encrypted in database
   - Use strong encryption keys (AES-256 minimum)

3. **Data in transit encryption**
   - HTTPS only for all communications
   - TLS 1.3 minimum for API calls

### Secure Coding Practices

#### Input Validation
```typescript
// ❌ BAD - No validation
const amount = request.body.amount;

// ✅ GOOD - Validate and sanitize
const amount = validateDecimal(request.body.amount, { min: 0, max: 1000000 });
```

#### SQL Injection Prevention
```python
# ❌ BAD - String concatenation
query = f"SELECT * FROM transactions WHERE user_id = {user_id}"

# ✅ GOOD - Parameterized queries
query = "SELECT * FROM transactions WHERE user_id = %s"
cursor.execute(query, (user_id,))
```

#### API Key Security
```typescript
// ❌ BAD - API key in frontend
const apiKey = "sk-1234567890abcdef";

// ✅ GOOD - API key in backend environment
const apiKey = process.env.KAGGLE_API_KEY;
```

## 🔐 Authentication & Authorization

### JWT Token Security
- **Short expiration**: 15 minutes for access tokens
- **Secure storage**: HttpOnly cookies for refresh tokens
- **Strong secrets**: Use `openssl rand -base64 32` to generate JWT secrets

### Session Management
```typescript
// Secure session configuration
const sessionConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
};
```

## 🌐 API Security

### Rate Limiting
```python
# Implement rate limiting to prevent abuse
RATE_LIMITS = {
    'transaction_categorization': '100/hour',
    'budget_analysis': '50/hour', 
    'financial_advice': '20/hour'
}
```

### CORS Configuration
```typescript
// Strict CORS for financial app
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 🔍 Security Monitoring

### Logging Security Events
```python
# Log security-relevant events
security_logger.info("User authentication success", {
    "user_id": user.id,
    "ip_address": request.remote_addr,
    "user_agent": request.headers.get('User-Agent')
})

# Never log sensitive data
security_logger.warning("Failed login attempt", {
    "email": user.email,  # ❌ Don't log email
    "ip_address": request.remote_addr
})
```

### Audit Trail
Track all financial operations:
- Transaction modifications
- Account access
- Permission changes
- Data exports

## 🚨 Incident Response

### If Secrets Are Accidentally Committed
1. **Immediate action**: Rotate all exposed credentials
2. **Git history**: Use `git filter-branch` or BFG to remove from history
3. **Notify team**: Inform all developers about the incident
4. **Review**: Audit what data might have been exposed

### Security Breach Protocol
1. **Isolate**: Immediately disable affected systems
2. **Assess**: Determine scope of potential data exposure
3. **Notify**: Follow legal requirements for breach notification
4. **Remediate**: Fix vulnerabilities and strengthen security

## 📋 Security Checklist

### Before Every Commit
- [ ] No secrets in code
- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info
- [ ] Audit logs for sensitive operations

### Before Every Deploy
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Database connections encrypted

### Monthly Review
- [ ] Rotate API keys and secrets
- [ ] Review access logs for anomalies
- [ ] Update dependencies for security patches
- [ ] Validate backup encryption
- [ ] Test incident response procedures

## 🔧 Security Tools

### Recommended Tools
```bash
# Secret scanning
pip install detect-secrets
detect-secrets scan --baseline .secrets.baseline

# Dependency vulnerability scanning  
npm audit
pip-audit

# Static code analysis
npm install -g eslint-plugin-security
bandit -r apps/backend/
```

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [SOC 2 Compliance](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)

---

> **Remember**: In financial applications, security is not optional. When in doubt, choose the more secure option.