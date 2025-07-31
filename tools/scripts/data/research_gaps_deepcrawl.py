#!/usr/bin/env python3
"""
Targeted Deep Crawl for Atomic Vertical Slice Hybrid Architecture Research Gaps
Focuses on missing patterns: vertical slicing, implementation details, tooling, case studies
"""

import asyncio
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Import Crawl4AI components
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, ContentTypeFilter
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy

class ArchitectureGapResearcher:
    """Fill specific research gaps identified in initial analysis"""
    
    def __init__(self):
        # Target the specific gaps identified
        self.gap_focus_terms = [
            # Vertical Slice Research (Gap #1)
            "vertical slice architecture",
            "feature slice architecture", 
            "domain driven design vertical",
            "feature based architecture",
            "slice based deployment",
            "vertical decomposition",
            
            # Implementation Patterns (Gap #2)
            "atomic component implementation",
            "self contained systems",
            "autonomous services implementation",
            "hybrid deployment patterns",
            "modular monolith to microservices",
            "architecture transition patterns",
            
            # Tooling Support (Gap #3)
            "vertical slice tooling",
            "atomic component tools",
            "hybrid architecture tools",
            "architecture migration tools",
            "modular deployment tools",
            
            # Case Studies (Gap #4)
            "architecture case study",
            "modular monolith case study",
            "microservices transition",
            "hybrid architecture example",
            "vertical slice example"
        ]
        
        # Target URLs for gap-specific research
        self.gap_research_urls = [
            # DDD and Vertical Slicing
            "https://martinfowler.com",
            "https://www.dddcommunity.org",
            
            # Implementation and Patterns
            "https://microservices.io",
            "https://patterns.dev",
            
            # Case Studies and Examples
            "https://netflix.com/techblog",
            "https://engineering.grab.com",
            "https://blog.twitter.com/engineering",
            "https://engineering.linkedin.com",
            
            # Architecture Communities
            "https://www.infoq.com",
            "https://highscalability.com"
        ]
        
        self.results = []

    async def setup_gap_focused_crawl_config(self):
        """Configure deep crawl strategy targeting research gaps"""
        
        # Create filter chain for gap-specific content
        filter_chain = FilterChain([
            # Focus on architecture, case studies, implementation
            URLPatternFilter(patterns=[
                "*architecture*", "*pattern*", "*design*", "*case-study*",
                "*implementation*", "*migration*", "*transition*", "*example*",
                "*ddd*", "*domain-driven*", "*vertical*", "*slice*", "*hybrid*",
                "*modular*", "*monolith*", "*microservices*", "*tooling*"
            ]),
            
            # Only HTML content
            ContentTypeFilter(allowed_types=["text/html"])
        ])
        
        # Create scorer for gap-specific content  
        gap_scorer = KeywordRelevanceScorer(
            keywords=self.gap_focus_terms
        )
        
        # Use deeper crawling for comprehensive gap research
        deep_crawl_strategy = BFSDeepCrawlStrategy(
            max_depth=3,  # Deeper for more comprehensive research
            include_external=False,
            max_pages=50,  # More pages for thorough coverage
            filter_chain=filter_chain
        )
        
        return CrawlerRunConfig(
            deep_crawl_strategy=deep_crawl_strategy,
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=True,
            stream=False
        )

    async def research_architecture_gaps(self):
        """Execute targeted deep crawl for identified research gaps"""
        
        print("🔍 Starting Gap-Focused Deep Crawl: Architecture Research Gaps")
        print("=" * 80)
        print("🎯 Focus Areas:")
        print("   1. Vertical Slice Architecture patterns")
        print("   2. Implementation patterns and tooling")
        print("   3. Real-world case studies")
        print("   4. Hybrid deployment strategies")
        print("=" * 80)
        
        config = await self.setup_gap_focused_crawl_config()
        
        async with AsyncWebCrawler() as crawler:
            for url in self.gap_research_urls:
                print(f"\n🚀 Deep crawling for gaps: {url}")
                try:
                    results = await crawler.arun(url, config=config)
                    
                    print(f"✅ Found {len(results)} pages")
                    
                    # Analyze results for gap-specific evidence
                    for result in results:
                        gap_evidence = self.analyze_content_for_gaps(result)
                        if gap_evidence:
                            self.results.append({
                                'url': result.url,
                                'title': result.metadata.get('title', 'Unknown'),
                                'depth': result.metadata.get('depth', 0),
                                'gap_evidence': gap_evidence,
                                'relevance_score': result.metadata.get('score', 0),
                                'timestamp': datetime.now().isoformat()
                            })
                            
                except Exception as e:
                    print(f"❌ Error crawling {url}: {str(e)}")
                    
        return self.compile_gap_research_findings()

    def analyze_content_for_gaps(self, crawl_result) -> Dict[str, Any]:
        """Analyze content specifically for research gap areas"""
        
        content = crawl_result.cleaned_html.lower()
        gap_evidence = {}
        
        # Gap 1: Vertical Slice Architecture Evidence
        vertical_slice_indicators = [
            "vertical slice", "feature slice", "domain slice", "feature based",
            "slice architecture", "vertical decomposition", "feature oriented",
            "domain driven vertical", "slice by feature", "vertical organization"
        ]
        
        # Gap 2: Implementation Pattern Evidence  
        implementation_indicators = [
            "implementation pattern", "code example", "how to implement",
            "step by step", "practical guide", "tutorial", "walkthrough",
            "architecture implementation", "migration steps", "transition guide"
        ]
        
        # Gap 3: Tooling Evidence
        tooling_indicators = [
            "tools", "framework", "library", "platform", "cli", "automation",
            "deployment tool", "architecture tool", "migration tool", "generator"
        ]
        
        # Gap 4: Case Study Evidence
        case_study_indicators = [
            "case study", "real world", "production", "at scale", "lessons learned",
            "experience report", "migration story", "transformation", "journey"
        ]
        
        # Score evidence for each gap area
        gap_evidence['vertical_slice_score'] = sum(1 for term in vertical_slice_indicators if term in content)
        gap_evidence['implementation_score'] = sum(1 for term in implementation_indicators if term in content)
        gap_evidence['tooling_score'] = sum(1 for term in tooling_indicators if term in content)
        gap_evidence['case_study_score'] = sum(1 for term in case_study_indicators if term in content)
        
        # Extract relevant snippets for each gap
        gap_evidence['gap_snippets'] = {}
        
        # Find vertical slice snippets
        gap_evidence['gap_snippets']['vertical_slice'] = []
        for term in vertical_slice_indicators:
            if term in content:
                start = max(0, content.find(term) - 150)
                end = min(len(content), content.find(term) + 150)
                snippet = content[start:end].strip()
                gap_evidence['gap_snippets']['vertical_slice'].append({
                    'term': term,
                    'context': snippet
                })
        
        # Find implementation snippets
        gap_evidence['gap_snippets']['implementation'] = []
        for term in implementation_indicators:
            if term in content:
                start = max(0, content.find(term) - 150)
                end = min(len(content), content.find(term) + 150)
                snippet = content[start:end].strip()
                gap_evidence['gap_snippets']['implementation'].append({
                    'term': term,
                    'context': snippet
                })
        
        # Calculate total relevance for gap research
        total_gap_score = (gap_evidence['vertical_slice_score'] + 
                          gap_evidence['implementation_score'] + 
                          gap_evidence['tooling_score'] + 
                          gap_evidence['case_study_score'])
        
        # Only return evidence if significant gap-relevant matches found
        return gap_evidence if total_gap_score > 0 or any(gap_evidence['gap_snippets'].values()) else None

    def compile_gap_research_findings(self):
        """Compile and analyze gap-focused research findings"""
        
        findings = {
            'research_focus': 'Atomic Vertical Slice Hybrid Architecture - Gap Analysis',
            'research_timestamp': datetime.now().isoformat(),
            'total_evidence_sources': len(self.results),
            'gap_analysis': {
                'vertical_slice_evidence': 0,
                'implementation_evidence': 0,
                'tooling_evidence': 0,
                'case_study_evidence': 0,
                'gap_filling_sources': [],
                'implementation_patterns': [],
                'tooling_discoveries': [],
                'case_studies_found': []
            },
            'gap_assessment': {},
            'detailed_gap_evidence': self.results
        }
        
        # Analyze gap-specific evidence
        for result in self.results:
            evidence = result['gap_evidence']
            
            if evidence['vertical_slice_score'] > 0:
                findings['gap_analysis']['vertical_slice_evidence'] += 1
                
            if evidence['implementation_score'] > 0:
                findings['gap_analysis']['implementation_evidence'] += 1
                
            if evidence['tooling_score'] > 0:
                findings['gap_analysis']['tooling_evidence'] += 1
                
            if evidence['case_study_score'] > 0:
                findings['gap_analysis']['case_study_evidence'] += 1
                
            # Collect high-value sources
            total_score = sum([
                evidence['vertical_slice_score'],
                evidence['implementation_score'], 
                evidence['tooling_score'],
                evidence['case_study_score']
            ])
            
            if total_score >= 2:  # High relevance threshold
                findings['gap_analysis']['gap_filling_sources'].append({
                    'url': result['url'],
                    'title': result['title'],
                    'gap_scores': {
                        'vertical_slice': evidence['vertical_slice_score'],
                        'implementation': evidence['implementation_score'],
                        'tooling': evidence['tooling_score'],
                        'case_study': evidence['case_study_score']
                    },
                    'total_gap_relevance': total_score
                })
        
        # Assess gap filling success
        findings['gap_assessment'] = self.assess_gap_filling_success(findings)
        
        return findings

    def assess_gap_filling_success(self, findings):
        """Assess how well the research filled identified gaps"""
        
        gap_counts = findings['gap_analysis']
        
        assessment = {
            'overall_gap_resolution': 'Unknown',
            'gap_resolution_confidence': 'Low',
            'most_resolved_gap': 'None',
            'least_resolved_gap': 'All gaps remain',
            'recommendations': []
        }
        
        # Analyze gap resolution
        gap_scores = {
            'vertical_slice': gap_counts['vertical_slice_evidence'],
            'implementation': gap_counts['implementation_evidence'],
            'tooling': gap_counts['tooling_evidence'],
            'case_study': gap_counts['case_study_evidence']
        }
        
        # Determine best and worst resolved gaps
        if max(gap_scores.values()) > 0:
            assessment['most_resolved_gap'] = max(gap_scores, key=gap_scores.get)
            assessment['least_resolved_gap'] = min(gap_scores, key=gap_scores.get)
            
            # Overall assessment based on evidence strength
            total_evidence = sum(gap_scores.values())
            if total_evidence >= 15:
                assessment['overall_gap_resolution'] = 'Significantly Resolved'
                assessment['gap_resolution_confidence'] = 'High'
            elif total_evidence >= 8:
                assessment['overall_gap_resolution'] = 'Partially Resolved'
                assessment['gap_resolution_confidence'] = 'Medium'
            elif total_evidence >= 3:
                assessment['overall_gap_resolution'] = 'Minimally Resolved'
                assessment['gap_resolution_confidence'] = 'Low'
        
        # Generate specific recommendations based on findings
        if gap_scores['vertical_slice'] >= 3:
            assessment['recommendations'].append("Strong vertical slice evidence found - proceed with pattern definition")
        else:
            assessment['recommendations'].append("Limited vertical slice evidence - consider original research contribution")
            
        if gap_scores['implementation'] >= 3:
            assessment['recommendations'].append("Implementation patterns identified - create practical guide")
        else:
            assessment['recommendations'].append("Implementation gap remains - develop proof-of-concept")
            
        if gap_scores['tooling'] >= 2:
            assessment['recommendations'].append("Tooling support found - evaluate existing solutions")
        else:
            assessment['recommendations'].append("Tooling gap identified - potential tool development opportunity")
            
        if gap_scores['case_study'] >= 2:
            assessment['recommendations'].append("Real-world examples found - analyze for pattern validation")
        else:
            assessment['recommendations'].append("Case study gap - create exemplar implementation")
            
        return assessment

    async def save_gap_research_results(self, findings, output_file="architecture_gaps_research.json"):
        """Save gap-focused research findings"""
        
        output_path = Path(output_file)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(findings, f, indent=2, ensure_ascii=False)
            
        print(f"\n📊 Gap research results saved to: {output_path}")
        return output_path

async def main():
    """Execute the gap-focused deep crawl research"""
    
    researcher = ArchitectureGapResearcher()
    
    print("🎯 Research Focus: Atomic Vertical Slice Hybrid Architecture - Gap Analysis")
    print("📝 Research Method: Targeted Deep Crawl for Identified Gaps")
    print("🎯 Objective: Fill research gaps in vertical slicing, implementation, tooling, and case studies\n")
    
    # Execute gap-focused research
    findings = await researcher.research_architecture_gaps()
    
    # Save results  
    output_file = await researcher.save_gap_research_results(findings)
    
    # Print summary
    print("\n" + "=" * 80)
    print("🔍 GAP RESEARCH SUMMARY")
    print("=" * 80)
    print(f"📊 Evidence Sources Found: {findings['total_evidence_sources']}")
    print(f"🎯 Vertical Slice Evidence: {findings['gap_analysis']['vertical_slice_evidence']}")
    print(f"⚙️  Implementation Evidence: {findings['gap_analysis']['implementation_evidence']}")
    print(f"🔧 Tooling Evidence: {findings['gap_analysis']['tooling_evidence']}")
    print(f"📋 Case Study Evidence: {findings['gap_analysis']['case_study_evidence']}")
    print(f"✅ Overall Gap Resolution: {findings['gap_assessment']['overall_gap_resolution']}")
    print(f"🎯 Resolution Confidence: {findings['gap_assessment']['gap_resolution_confidence']}")
    
    if findings['gap_assessment']['recommendations']:
        print("\n💡 GAP-SPECIFIC RECOMMENDATIONS:")
        for rec in findings['gap_assessment']['recommendations']:
            print(f"   • {rec}")
    
    print(f"\n📄 Full gap analysis: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())