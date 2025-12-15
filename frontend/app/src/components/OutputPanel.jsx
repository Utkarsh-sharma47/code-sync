import React from 'react';
import { Terminal, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const OutputPanel = ({ output, testResults }) => {
  return (
    <div className="h-full bg-slate-950 flex flex-col">
      <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center">
            <Terminal size={14} className="text-slate-500 mr-2" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Output</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm custom-scrollbar">
        {!output && !testResults ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
            <Clock size={24} className="mb-2" />
            <p>Run code to see results</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Error Display */}
            {output?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                <div className="flex items-center gap-2 mb-1 text-red-400 font-bold">
                  <AlertTriangle size={14} /> Error
                </div>
                <pre className="whitespace-pre-wrap text-xs">{output.error}</pre>
              </div>
            )}

            {/* Test Results Display */}
            {testResults && (
                <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Cases</div>
                    {testResults.map((res, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${res.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>Test Case {res.testCase}</span>
                                {res.passed ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                            </div>
                            {!res.passed && (
                                <div className="text-xs space-y-1 mt-2 bg-black/20 p-2 rounded">
                                    <div className="text-slate-400">Exp: <span className="text-emerald-400">{res.expected}</span></div>
                                    <div className="text-slate-400">Act: <span className="text-red-400">{res.actual}</span></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Output (if no test cases) */}
            {output?.output && !testResults && (
                <div className="text-slate-300 whitespace-pre-wrap">{output.output}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;