#!/usr/bin/env python3
"""
Deep Crawl Research: Pain Points Solutions Discovery
Searches for existing tools, repos, and implementations that solve each identified pain point
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any
import logging
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PainPointSolutionsResearcher:
    def __init__(self):
        # Pain points with targeted search strategies
        self.pain_points = {
            "guilt_inducing_design": {
                "description": "Apps make users feel bad about spending",
                "search_terms": [
                    "positive psychology financial app github",
                    "supportive budgeting UI design open source",
                    "guilt-free money management app",
                    "encouraging expense tracker github",
                    "financial wellness app positive reinforcement",
                    "non-judgmental budget app design patterns"
                ],
                "github_topics": ["positive-ux", "financial-wellness", "supportive-design"],
                "key_features": ["positive messaging", "encouraging UI", "progress celebration"]
            },
            "poor_real_time_accountability": {
                "description": "No proactive spending prevention",
                "search_terms": [
                    "proactive spending alerts github",
                    "real-time budget monitoring open source",
                    "predictive spending prevention app",
                    "before-purchase budget check system",
                    "spending intervention notification system",
                    "real-time financial accountability tools"
                ],
                "github_topics": ["real-time-alerts", "spending-prevention", "proactive-budgeting"],
                "key_features": ["pre-purchase alerts", "real-time monitoring", "predictive warnings"]
            },
            "overwhelming_complexity": {
                "description": "Too many categories (15+)",
                "search_terms": [
                    "simplified budget categories github",
                    "minimal expense tracker categories",
                    "smart category consolidation financial app",
                    "3-5 category budget system",
                    "simple money management categories",
                    "automated category simplification"
                ],
                "github_topics": ["simple-budgeting", "minimal-ui", "category-management"],
                "key_features": ["few categories", "smart grouping", "simple interface"]
            },
            "tedious_categorization": {
                "description": "Manual maintenance and errors",
                "search_terms": [
                    "AI transaction categorization github",
                    "machine learning expense categorization",
                    "automated budget categorization open source",
                    "smart receipt scanning categorization",
                    "NLP financial transaction classification",
                    "auto-categorization budget app"
                ],
                "github_topics": ["ai-categorization", "ml-finance", "auto-classification"],
                "key_features": ["AI/ML categorization", "learning system", "minimal manual input"]
            },
            "steep_learning_curves": {
                "description": "Complex setup and usage",
                "search_terms": [
                    "simple onboarding financial app github",
                    "easy setup budget tracker",
                    "progressive disclosure finance UI",
                    "guided tour budget app open source",
                    "intuitive financial app onboarding",
                    "zero-config expense tracker"
                ],
                "github_topics": ["easy-onboarding", "user-friendly", "simple-setup"],
                "key_features": ["quick setup", "guided onboarding", "progressive complexity"]
            },
            "price_increases": {
                "description": "$100+/year costs",
                "search_terms": [
                    "free open source budget app",
                    "self-hosted financial tracker",
                    "no subscription expense tracker github",
                    "lifetime purchase budget app",
                    "freemium financial management",
                    "community-driven budget tools"
                ],
                "github_topics": ["open-source", "self-hosted", "free-forever"],
                "key_features": ["free/open source", "self-hosted option", "no subscriptions"]
            },
            "bank_sync_issues": {
                "description": "Unreliable connections",
                "search_terms": [
                    "reliable bank sync open source",
                    "plaid alternative github",
                    "robust financial data aggregation",
                    "offline-first budget tracker",
                    "manual import expense tracker",
                    "bank connection fallback system"
                ],
                "github_topics": ["bank-sync", "data-import", "offline-first"],
                "key_features": ["multiple sync methods", "offline capability", "import options"]
            },
            "missing_rollover_features": {
                "description": "No rollover budgets",
                "search_terms": [
                    "rollover budget system github",
                    "envelope budgeting open source",
                    "YNAB4 clone features",
                    "carry-forward budget tracker",
                    "flexible budget periods app",
                    "goal-based rollover budgeting"
                ],
                "github_topics": ["envelope-budgeting", "rollover-budgets", "flexible-budgeting"],
                "key_features": ["budget rollover", "envelope method", "flexible periods"]
            },
            "reactive_not_proactive": {
                "description": "Warnings after overspending",
                "search_terms": [
                    "predictive budget alerts github",
                    "proactive spending warnings",
                    "before-purchase budget check",
                    "spending velocity alerts",
                    "trend-based budget warnings",
                    "preventive financial notifications"
                ],
                "github_topics": ["predictive-analytics", "proactive-alerts", "spending-prevention"],
                "key_features": ["predictive alerts", "trend analysis", "before-purchase checks"]
            },
            "lack_family_integration": {
                "description": "No family/partner features",
                "search_terms": [
                    "family budget app github",
                    "shared expense tracker open source",
                    "multi-user financial management",
                    "couple budget app features",
                    "household expense sharing system",
                    "collaborative budgeting platform"
                ],
                "github_topics": ["family-budgeting", "multi-user", "shared-expenses"],
                "key_features": ["multi-user support", "permission system", "shared budgets"]
            }
        }
        
        self.browser_config = BrowserConfig(
            headless=True,
            viewport={"width": 1920, "height": 1080}
        )

    async def search_github_repos(self, search_term: str) -> List[Dict[str, Any]]:
        """Search GitHub for repositories matching the search term"""
        # Use GitHub API search endpoint instead of web scraping
        api_search_url = f"https://api.github.com/search/repositories?q={search_term.replace(' ', '+')}&sort=stars&order=desc&per_page=5"
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            run_config = CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                delay_before_return_html=1.0
            )
            
            try:
                result = await crawler.arun(
                    url=api_search_url,
                    config=run_config
                )
                
                if result.success:
                    # Parse JSON response
                    import json
                    data = json.loads(result.cleaned_html or result.raw_html)
                    
                    repos = []
                    for item in data.get("items", [])[:5]:
                        repo_info = {
                            "name": item.get("full_name", ""),
                            "url": item.get("html_url", ""),
                            "description": item.get("description", ""),
                            "stars": item.get("stargazers_count", 0),
                            "language": item.get("language", ""),
                            "topics": item.get("topics", []),
                            "search_term": search_term
                        }
                        repos.append(repo_info)
                    
                    return repos
            except Exception as e:
                logger.error(f"Error searching GitHub: {str(e)}")
            
            return []

    async def analyze_repo_details(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze repository details from already fetched data"""
        # Since we already have the data from GitHub API, just return it
        return repo_data

    async def search_design_patterns(self, pain_point: str, search_terms: List[str]) -> List[Dict[str, Any]]:
        """Search for design patterns and implementation examples"""
        patterns = []
        
        # For now, we'll focus on GitHub repos which have better API access
        # Design patterns can be extracted from the repos we find
        
        return patterns

    async def research_pain_point(self, pain_point_key: str, pain_point_data: Dict[str, Any]) -> Dict[str, Any]:
        """Research solutions for a specific pain point"""
        logger.info(f"Researching: {pain_point_key} - {pain_point_data['description']}")
        
        results = {
            "pain_point": pain_point_key,
            "description": pain_point_data["description"],
            "github_repos": [],
            "design_patterns": [],
            "key_implementations": [],
            "recommended_solutions": []
        }
        
        # Search GitHub repositories
        for search_term in pain_point_data["search_terms"][:2]:  # Limit searches
            repos = await self.search_github_repos(search_term)
            results["github_repos"].extend(repos)
            await asyncio.sleep(1)  # Rate limiting
        
        # Search for design patterns
        patterns = await self.search_design_patterns(
            pain_point_key, 
            pain_point_data["search_terms"]
        )
        results["design_patterns"] = patterns
        
        # Analyze and recommend top solutions
        results["recommended_solutions"] = self.analyze_solutions(results)
        
        return results

    def analyze_solutions(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze found solutions and recommend the best ones"""
        recommendations = []
        
        # Analyze GitHub repos
        sorted_repos = sorted(
            results["github_repos"], 
            key=lambda x: int(x.get("stars", 0)), 
            reverse=True
        )
        
        for repo in sorted_repos[:3]:
            if int(repo.get("stars", 0)) > 50:  # Quality threshold
                recommendations.append({
                    "type": "github_repo",
                    "name": repo["name"],
                    "url": repo["url"],
                    "stars": repo["stars"],
                    "description": repo["description"],
                    "implementation_language": repo.get("language", "Unknown"),
                    "relevance": "High" if int(repo.get("stars", 0)) > 500 else "Medium"
                })
        
        return recommendations

    async def run_research(self):
        """Run the complete research process"""
        all_results = {
            "research_timestamp": datetime.now().isoformat(),
            "pain_point_solutions": {},
            "summary": {
                "total_repos_found": 0,
                "total_patterns_found": 0,
                "high_quality_solutions": 0
            }
        }
        
        # Research each pain point
        for pain_point_key, pain_point_data in self.pain_points.items():
            try:
                results = await self.research_pain_point(pain_point_key, pain_point_data)
                all_results["pain_point_solutions"][pain_point_key] = results
                
                # Update summary
                all_results["summary"]["total_repos_found"] += len(results["github_repos"])
                all_results["summary"]["total_patterns_found"] += len(results["design_patterns"])
                all_results["summary"]["high_quality_solutions"] += len(results["recommended_solutions"])
                
                # Save intermediate results
                with open(f"pain_point_{pain_point_key}_research.json", "w") as f:
                    json.dump(results, f, indent=2)
                
                logger.info(f"Completed research for: {pain_point_key}")
                await asyncio.sleep(2)  # Rate limiting between pain points
                
            except Exception as e:
                logger.error(f"Error researching {pain_point_key}: {str(e)}")
                continue
        
        # Save complete results
        with open("pain_points_solutions_research.json", "w") as f:
            json.dump(all_results, f, indent=2)
        
        # Generate integration roadmap
        roadmap = self.generate_integration_roadmap(all_results)
        with open("pain_points_integration_roadmap.md", "w") as f:
            f.write(roadmap)
        
        return all_results

    def generate_integration_roadmap(self, research_results: Dict[str, Any]) -> str:
        """Generate a markdown roadmap for integrating discovered solutions"""
        roadmap = """# Pain Points Solutions Integration Roadmap

## Overview
This roadmap outlines how to integrate proven solutions from existing tools and repos into our Atlas Financial app.

Generated: {timestamp}

---

""".format(timestamp=research_results["research_timestamp"])
        
        for pain_point_key, results in research_results["pain_point_solutions"].items():
            pain_point_title = pain_point_key.replace("_", " ").title()
            roadmap += f"## {pain_point_title}\n\n"
            roadmap += f"**Problem**: {results['description']}\n\n"
            
            if results["recommended_solutions"]:
                roadmap += "### Recommended Solutions\n\n"
                for i, solution in enumerate(results["recommended_solutions"], 1):
                    roadmap += f"{i}. **{solution['name']}**\n"
                    roadmap += f"   - Type: {solution['type']}\n"
                    roadmap += f"   - URL: {solution['url']}\n"
                    roadmap += f"   - Stars: {solution.get('stars', 'N/A')}\n"
                    roadmap += f"   - Language: {solution.get('implementation_language', 'N/A')}\n"
                    roadmap += f"   - Description: {solution.get('description', 'N/A')}\n\n"
            
            roadmap += "### Integration Strategy\n"
            roadmap += f"- Review top implementations for {pain_point_key}\n"
            roadmap += "- Extract relevant patterns and adapt to our architecture\n"
            roadmap += "- Implement within our vertical slice structure\n\n"
            roadmap += "---\n\n"
        
        return roadmap

async def main():
    researcher = PainPointSolutionsResearcher()
    results = await researcher.run_research()
    
    print(f"\nResearch complete!")
    print(f"Total repositories found: {results['summary']['total_repos_found']}")
    print(f"Total design patterns found: {results['summary']['total_patterns_found']}")
    print(f"High quality solutions identified: {results['summary']['high_quality_solutions']}")
    print("\nResults saved to:")
    print("- Individual pain points: pain_point_*_research.json")
    print("- Complete results: pain_points_solutions_research.json")
    print("- Integration roadmap: pain_points_integration_roadmap.md")

if __name__ == "__main__":
    asyncio.run(main())