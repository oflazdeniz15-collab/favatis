#!/usr/bin/env python3
"""
Favatis Website Maintenance Automation Script
==============================================
This script automates common maintenance tasks:
1. Broken link detection
2. Security header checks
3. SSL certificate validation
4. Performance monitoring
5. Dependency vulnerability scanning
6. Uptime monitoring

Run with: python maintenance.py --full
Schedule with cron: 0 6 * * * /path/to/maintenance.py --full >> /var/log/favatis-maintenance.log 2>&1
"""

import argparse
import json
import re
import ssl
import socket
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Try to import optional dependencies
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("⚠️  Install requests for full functionality: pip install requests")

# Configuration
CONFIG = {
    "site_url": "https://favatis.vercel.app",
    "pages_to_check": [
        "/",
        "/artists",
        "/contact",
        "/login",
        "/artist-signup"
    ],
    "max_link_depth": 2,
    "timeout": 10,
    "user_agent": "FavatisBot/1.0 (Maintenance Check)",
    "security_headers": [
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Content-Security-Policy",
        "Referrer-Policy"
    ],
    "report_dir": "./maintenance_reports"
}


class MaintenanceReport:
    """Generates and stores maintenance reports."""
    
    def __init__(self):
        self.timestamp = datetime.now()
        self.results = {
            "timestamp": self.timestamp.isoformat(),
            "broken_links": [],
            "security_issues": [],
            "ssl_status": {},
            "performance": {},
            "vulnerabilities": [],
            "summary": {}
        }
    
    def add_broken_link(self, source, target, status_code, error=""):
        self.results["broken_links"].append({
            "source": source,
            "target": target,
            "status_code": status_code,
            "error": error
        })
    
    def add_security_issue(self, issue, severity, recommendation):
        self.results["security_issues"].append({
            "issue": issue,
            "severity": severity,
            "recommendation": recommendation
        })
    
    def set_ssl_status(self, valid, expiry, issuer, days_remaining):
        self.results["ssl_status"] = {
            "valid": valid,
            "expiry": expiry,
            "issuer": issuer,
            "days_remaining": days_remaining
        }
    
    def add_performance_metric(self, url, load_time, size):
        self.results["performance"][url] = {
            "load_time_ms": load_time,
            "size_bytes": size
        }
    
    def add_vulnerability(self, package, severity, version, advisory):
        self.results["vulnerabilities"].append({
            "package": package,
            "severity": severity,
            "current_version": version,
            "advisory": advisory
        })
    
    def generate_summary(self):
        self.results["summary"] = {
            "total_broken_links": len(self.results["broken_links"]),
            "total_security_issues": len(self.results["security_issues"]),
            "ssl_valid": self.results["ssl_status"].get("valid", False),
            "ssl_days_remaining": self.results["ssl_status"].get("days_remaining", 0),
            "total_vulnerabilities": len(self.results["vulnerabilities"]),
            "overall_status": self._calculate_overall_status()
        }
    
    def _calculate_overall_status(self):
        issues = 0
        if self.results["broken_links"]:
            issues += len(self.results["broken_links"])
        if self.results["security_issues"]:
            issues += len([i for i in self.results["security_issues"] if i["severity"] in ["high", "critical"]])
        if self.results["ssl_status"].get("days_remaining", 30) < 14:
            issues += 5
        if self.results["vulnerabilities"]:
            issues += len([v for v in self.results["vulnerabilities"] if v["severity"] in ["high", "critical"]])
        
        if issues == 0:
            return "✅ HEALTHY"
        elif issues < 3:
            return "⚠️  NEEDS ATTENTION"
        else:
            return "🚨 ACTION REQUIRED"
    
    def save(self):
        report_dir = Path(CONFIG["report_dir"])
        report_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"maintenance_report_{self.timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        filepath = report_dir / filename
        
        with open(filepath, "w") as f:
            json.dump(self.results, f, indent=2, default=str)
        
        return filepath
    
    def print_console_report(self):
        print("\n" + "=" * 60)
        print("🔧 FAVATIS MAINTENANCE REPORT")
        print(f"📅 {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # SSL Status
        ssl_status = self.results["ssl_status"]
        if ssl_status:
            ssl_emoji = "✅" if ssl_status.get("valid") else "❌"
            print(f"\n{ssl_emoji} SSL Certificate:")
            print(f"   Expires: {ssl_status.get('expiry', 'Unknown')}")
            print(f"   Days Remaining: {ssl_status.get('days_remaining', 'Unknown')}")
        
        # Broken Links
        broken = self.results["broken_links"]
        if broken:
            print(f"\n❌ Broken Links Found: {len(broken)}")
            for link in broken[:5]:
                print(f"   • {link['target']} (from {link['source']}) - {link['status_code']}")
            if len(broken) > 5:
                print(f"   ... and {len(broken) - 5} more")
        else:
            print("\n✅ No Broken Links Found")
        
        # Security Issues
        security = self.results["security_issues"]
        if security:
            print(f"\n⚠️  Security Issues: {len(security)}")
            for issue in security:
                severity_emoji = "🔴" if issue["severity"] in ["high", "critical"] else "🟡"
                print(f"   {severity_emoji} {issue['issue']}")
        else:
            print("\n✅ Security Headers OK")
        
        # Vulnerabilities
        vulns = self.results["vulnerabilities"]
        if vulns:
            print(f"\n🚨 Dependency Vulnerabilities: {len(vulns)}")
            for vuln in vulns[:5]:
                print(f"   • {vuln['package']} ({vuln['severity']})")
        else:
            print("\n✅ No Known Vulnerabilities")
        
        # Performance
        perf = self.results["performance"]
        if perf:
            print("\n📊 Performance Metrics:")
            for url, metrics in list(perf.items())[:3]:
                print(f"   • {url}: {metrics['load_time_ms']}ms")
        
        # Summary
        self.generate_summary()
        print("\n" + "-" * 60)
        print(f"📋 Overall Status: {self.results['summary']['overall_status']}")
        print("=" * 60 + "\n")


def check_broken_links(report):
    """Check for broken links across the site."""
    if not REQUESTS_AVAILABLE:
        print("⚠️  Skipping link check (requests not installed)")
        return
    
    print("🔗 Checking for broken links...")
    
    session = requests.Session()
    session.headers["User-Agent"] = CONFIG["user_agent"]
    
    checked_urls = set()
    urls_to_check = [(CONFIG["site_url"] + page, "/") for page in CONFIG["pages_to_check"]]
    
    for url, source in urls_to_check:
        if url in checked_urls:
            continue
        checked_urls.add(url)
        
        try:
            response = session.get(url, timeout=CONFIG["timeout"], allow_redirects=True)
            
            if response.status_code >= 400:
                report.add_broken_link(source, url, response.status_code)
            else:
                report.add_performance_metric(
                    url.replace(CONFIG["site_url"], ""),
                    int(response.elapsed.total_seconds() * 1000),
                    len(response.content)
                )
                
                # Extract links from HTML (basic extraction)
                if CONFIG["max_link_depth"] > 0:
                    links = re.findall(r'href=["\']([^"\']+)["\']', response.text)
                    for link in links:
                        if link.startswith("/") and not link.startswith("//"):
                            full_url = urljoin(CONFIG["site_url"], link)
                            if full_url not in checked_urls:
                                urls_to_check.append((full_url, url))
        
        except requests.exceptions.Timeout:
            report.add_broken_link(source, url, 0, "Timeout")
        except requests.exceptions.RequestException as e:
            report.add_broken_link(source, url, 0, str(e))


def check_security_headers(report):
    """Check for important security headers."""
    if not REQUESTS_AVAILABLE:
        print("⚠️  Skipping security header check (requests not installed)")
        return
    
    print("🔒 Checking security headers...")
    
    try:
        response = requests.get(
            CONFIG["site_url"],
            timeout=CONFIG["timeout"],
            headers={"User-Agent": CONFIG["user_agent"]}
        )
        
        headers = response.headers
        
        for header in CONFIG["security_headers"]:
            if header not in headers:
                severity = "high" if header in ["Strict-Transport-Security", "Content-Security-Policy"] else "medium"
                report.add_security_issue(
                    f"Missing {header} header",
                    severity,
                    f"Add {header} header to your server configuration"
                )
        
        # Check for X-Powered-By (should be removed)
        if "X-Powered-By" in headers:
            report.add_security_issue(
                "X-Powered-By header exposed",
                "low",
                "Remove X-Powered-By header to hide server technology"
            )
        
    except Exception as e:
        report.add_security_issue(f"Could not check headers: {e}", "high", "Ensure site is accessible")


def check_ssl_certificate(report):
    """Check SSL certificate validity and expiration."""
    print("🔐 Checking SSL certificate...")
    
    parsed = urlparse(CONFIG["site_url"])
    hostname = parsed.hostname
    port = 443
    
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=CONFIG["timeout"]) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                
                # Parse expiry date
                expiry_str = cert.get("notAfter", "")
                expiry = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
                days_remaining = (expiry - datetime.now()).days
                
                # Get issuer
                issuer = dict(x[0] for x in cert.get("issuer", []))
                issuer_name = issuer.get("organizationName", "Unknown")
                
                valid = days_remaining > 0
                
                report.set_ssl_status(valid, expiry_str, issuer_name, days_remaining)
                
                if days_remaining < 14:
                    report.add_security_issue(
                        f"SSL certificate expires in {days_remaining} days",
                        "critical" if days_remaining < 7 else "high",
                        "Renew SSL certificate immediately"
                    )
    
    except Exception as e:
        report.set_ssl_status(False, "", "", 0)
        report.add_security_issue(f"SSL check failed: {e}", "critical", "Verify SSL configuration")


def check_npm_vulnerabilities(report):
    """Check for npm package vulnerabilities."""
    print("📦 Checking npm vulnerabilities...")
    
    frontend_path = Path("./frontend")
    if not frontend_path.exists():
        print("   ⚠️  Frontend directory not found, skipping")
        return
    
    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            cwd=frontend_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0 and result.stdout:
            audit_data = json.loads(result.stdout)
            
            vulnerabilities = audit_data.get("vulnerabilities", {})
            for pkg_name, vuln_info in vulnerabilities.items():
                severity = vuln_info.get("severity", "unknown")
                version = vuln_info.get("range", "unknown")
                
                report.add_vulnerability(
                    pkg_name,
                    severity,
                    version,
                    f"Run 'npm audit fix' to resolve"
                )
    
    except subprocess.TimeoutExpired:
        print("   ⚠️  npm audit timed out")
    except FileNotFoundError:
        print("   ⚠️  npm not found in PATH")
    except json.JSONDecodeError:
        print("   ⚠️  Could not parse npm audit output")
    except Exception as e:
        print(f"   ⚠️  Error running npm audit: {e}")


def main():
    parser = argparse.ArgumentParser(description="Favatis Website Maintenance Script")
    parser.add_argument("--links", action="store_true", help="Check for broken links")
    parser.add_argument("--security", action="store_true", help="Check security headers")
    parser.add_argument("--ssl", action="store_true", help="Check SSL certificate")
    parser.add_argument("--vulnerabilities", action="store_true", help="Check npm vulnerabilities")
    parser.add_argument("--full", action="store_true", help="Run all checks")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    
    args = parser.parse_args()
    
    # Default to full check if no options specified
    if not any([args.links, args.security, args.ssl, args.vulnerabilities, args.full]):
        args.full = True
    
    report = MaintenanceReport()
    
    if args.full or args.ssl:
        check_ssl_certificate(report)
    
    if args.full or args.security:
        check_security_headers(report)
    
    if args.full or args.links:
        check_broken_links(report)
    
    if args.full or args.vulnerabilities:
        check_npm_vulnerabilities(report)
    
    report.generate_summary()
    
    if args.json:
        print(json.dumps(report.results, indent=2, default=str))
    else:
        report.print_console_report()
    
    # Save report
    filepath = report.save()
    if not args.json:
        print(f"📄 Report saved to: {filepath}\n")
    
    # Exit with error code if issues found
    if report.results["summary"]["overall_status"] == "🚨 ACTION REQUIRED":
        sys.exit(1)


if __name__ == "__main__":
    main()
