#!/usr/bin/env python3
"""
Deep crawl research for "Atomic Vertical Slice Hybrid Architecture" theory
Using Crawl4AI to systematically analyze architectural patterns
"""

import asyncio
import json
from pathlib import Path
from datetime import datetime

# Import Crawl4AI components based on official documentation
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, ContentTypeFilter
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy

class AtomicVerticalSliceResearcher:
    """Research tool for Atomic Vertical Slice Hybrid Architecture theory"""
    
    def __init__(self):
        self.research_terms = [
            "atomic vertical slice hybrid architecture",
            "atomic architecture patterns",
            "vertical slice architecture", 
            "hybrid architecture",
            "atomic components",
            "vertical slicing",
            "hybrid deployment"
        ]
        
        # Target URLs for architectural research
        self.research_urls = [
            "https://martinfowler.com",
            "https://patterns.dev"
        ]
        
        self.results = []

    async def setup_deep_crawl_config(self):
        """Configure deep crawl strategy for architectural research"""
        
        # Create filter chain for architectural content
        filter_chain = FilterChain([
            # Focus on documentation and architectural content
            URLPatternFilter(patterns=[
                "*architecture*", "*pattern*", "*design*", "*guide*", 
                "*docs*", "*documentation*", "*best-practices*"
            ]),
            
            # Only HTML content
            ContentTypeFilter(allowed_types=["text/html"])
        ])
        
        # Create scorer for architecture-relevant content  
        architecture_scorer = KeywordRelevanceScorer(
            keywords=self.research_terms
        )
        
        # Use BFSDeepCrawlStrategy for reliable crawling
        deep_crawl_strategy = BFSDeepCrawlStrategy(
            max_depth=2,
            include_external=False,
            max_pages=30,
            filter_chain=filter_chain
        )
        
        return CrawlerRunConfig(
            deep_crawl_strategy=deep_crawl_strategy,
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=True,
            stream=False  # Get all results at once for analysis
        )

    async def research_atomic_vertical_slice_hybrid(self):
        """Execute deep crawl research for the architecture theory"""
        
        print("🔍 Starting Deep Crawl Research: Atomic Vertical Slice Hybrid Architecture")
        print("=" * 80)
        
        config = await self.setup_deep_crawl_config()
        
        async with AsyncWebCrawler() as crawler:
            for url in self.research_urls:
                print(f"\n🚀 Deep crawling: {url}")
                try:
                    results = await crawler.arun(url, config=config)
                    
                    print(f"✅ Found {len(results)} pages")
                    
                    # Analyze results for architecture patterns
                    for result in results:
                        evidence = self.analyze_content_for_theory(result)
                        if evidence:
                            self.results.append({
                                'url': result.url,
                                'title': result.metadata.get('title', 'Unknown'),
                                'depth': result.metadata.get('depth', 0),
                                'evidence': evidence,
                                'relevance_score': result.metadata.get('score', 0),
                                'timestamp': datetime.now().isoformat()
                            })
                            
                except Exception as e:
                    print(f"❌ Error crawling {url}: {str(e)}")
                    
        return self.compile_research_findings()

    def analyze_content_for_theory(self, crawl_result):
        """Analyze crawled content for evidence of Atomic Vertical Slice Hybrid Architecture"""
        
        content = crawl_result.cleaned_html.lower()
        evidence = {}
        
        # Check for atomic patterns
        atomic_indicators = [
            "atomic", "independent components", "self-contained", 
            "autonomous", "isolated units"
        ]
        
        # Check for vertical slice patterns  
        vertical_slice_indicators = [
            "vertical slice", "feature slice", "cross-cutting", 
            "end-to-end", "full stack feature"
        ]
        
        # Check for hybrid patterns
        hybrid_indicators = [
            "hybrid", "mixed approach", "combined", "flexible deployment",
            "adaptive architecture"
        ]
        
        # Score evidence for each aspect
        evidence['atomic_score'] = sum(1 for term in atomic_indicators if term in content)
        evidence['vertical_slice_score'] = sum(1 for term in vertical_slice_indicators if term in content)  
        evidence['hybrid_score'] = sum(1 for term in hybrid_indicators if term in content)
        
        # Extract relevant snippets
        evidence['snippets'] = []
        for term in self.research_terms:
            if term in content:
                # Find context around the term
                start = max(0, content.find(term) - 100)
                end = min(len(content), content.find(term) + 100)
                snippet = content[start:end].strip()
                evidence['snippets'].append({
                    'term': term,
                    'context': snippet
                })
        
        # Only return evidence if significant matches found
        total_score = evidence['atomic_score'] + evidence['vertical_slice_score'] + evidence['hybrid_score']
        return evidence if total_score > 0 or evidence['snippets'] else None

    def compile_research_findings(self):
        """Compile and analyze all research findings"""
        
        findings = {
            'theory': 'Atomic Vertical Slice Hybrid Architecture',
            'research_timestamp': datetime.now().isoformat(),
            'total_evidence_sources': len(self.results),
            'evidence_summary': {
                'atomic_patterns_found': 0,
                'vertical_slice_patterns_found': 0, 
                'hybrid_patterns_found': 0,
                'supporting_sources': [],
                'related_patterns': []
            },
            'feasibility_analysis': {},
            'detailed_evidence': self.results
        }
        
        # Analyze evidence
        for result in self.results:
            evidence = result['evidence']
            
            if evidence['atomic_score'] > 0:
                findings['evidence_summary']['atomic_patterns_found'] += 1
                
            if evidence['vertical_slice_score'] > 0:
                findings['evidence_summary']['vertical_slice_patterns_found'] += 1
                
            if evidence['hybrid_score'] > 0:
                findings['evidence_summary']['hybrid_patterns_found'] += 1
                
            if any([evidence['atomic_score'], evidence['vertical_slice_score'], evidence['hybrid_score']]):
                findings['evidence_summary']['supporting_sources'].append({
                    'url': result['url'],
                    'title': result['title'], 
                    'total_score': sum([evidence['atomic_score'], evidence['vertical_slice_score'], evidence['hybrid_score']])
                })
        
        # Determine theory feasibility
        findings['feasibility_analysis'] = self.assess_theory_feasibility(findings)
        
        return findings

    def assess_theory_feasibility(self, findings):
        """Assess the feasibility of Atomic Vertical Slice Hybrid Architecture theory"""
        
        evidence_count = findings['total_evidence_sources']
        atomic_support = findings['evidence_summary']['atomic_patterns_found']
        vertical_support = findings['evidence_summary']['vertical_slice_patterns_found'] 
        hybrid_support = findings['evidence_summary']['hybrid_patterns_found']
        
        assessment = {
            'overall_feasibility': 'Unknown',
            'confidence_level': 'Low',
            'supporting_evidence_strength': 'Insufficient',
            'architectural_soundness': 'Needs Analysis',
            'implementation_practicality': 'Unclear',
            'recommendations': []
        }
        
        # Analyze evidence strength
        if evidence_count >= 10:
            if atomic_support >= 3 and vertical_support >= 3 and hybrid_support >= 2:
                assessment['overall_feasibility'] = 'Highly Feasible'
                assessment['confidence_level'] = 'High'
                assessment['supporting_evidence_strength'] = 'Strong'
            elif atomic_support >= 2 and vertical_support >= 2:
                assessment['overall_feasibility'] = 'Feasible with Modifications'
                assessment['confidence_level'] = 'Medium'
                assessment['supporting_evidence_strength'] = 'Moderate'
        
        # Generate recommendations
        if atomic_support > 0:
            assessment['recommendations'].append("Atomic component patterns show promise - investigate further")
            
        if vertical_support > 0:
            assessment['recommendations'].append("Vertical slice architecture has established precedents")
            
        if hybrid_support > 0:
            assessment['recommendations'].append("Hybrid approaches are documented in industry")
        else:
            assessment['recommendations'].append("Hybrid aspect needs more research - may be novel contribution")
            
        return assessment

    async def save_research_results(self, findings, output_file="atomic_vertical_slice_research.json"):
        """Save research findings to file"""
        
        output_path = Path(output_file)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(findings, f, indent=2, ensure_ascii=False)
            
        print(f"\n📊 Research results saved to: {output_path}")
        return output_path

async def main():
    """Execute the deep crawl research"""
    
    researcher = AtomicVerticalSliceResearcher()
    
    print("🎯 Theory: Atomic Vertical Slice Hybrid Architecture")
    print("📝 Research Method: Deep Crawl Analysis using Crawl4AI")
    print("🎯 Objective: Determine architectural feasibility and soundness\n")
    
    # Execute research
    findings = await researcher.research_atomic_vertical_slice_hybrid()
    
    # Save results  
    output_file = await researcher.save_research_results(findings)
    
    # Print summary
    print("\n" + "=" * 80)
    print("🔍 RESEARCH SUMMARY")
    print("=" * 80)
    print(f"📊 Evidence Sources Found: {findings['total_evidence_sources']}")
    print(f"⚛️  Atomic Pattern Evidence: {findings['evidence_summary']['atomic_patterns_found']}")
    print(f"📏 Vertical Slice Evidence: {findings['evidence_summary']['vertical_slice_patterns_found']}")
    print(f"🔀 Hybrid Pattern Evidence: {findings['evidence_summary']['hybrid_patterns_found']}")
    print(f"✅ Overall Feasibility: {findings['feasibility_analysis']['overall_feasibility']}")
    print(f"🎯 Confidence Level: {findings['feasibility_analysis']['confidence_level']}")
    
    if findings['feasibility_analysis']['recommendations']:
        print("\n💡 RECOMMENDATIONS:")
        for rec in findings['feasibility_analysis']['recommendations']:
            print(f"   • {rec}")
    
    print(f"\n📄 Full results: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())