"""RulesHub CLI — install, publish, and manage AI coding tool assets.

This Python package is a thin wrapper around the canonical Rust binary
distributed via platform-specific wheels. The binary is embedded at
import time; running ``ruleshub`` invokes ``ruleshub._launcher:main``
which exec's the platform-matching binary.
"""

__version__ = "0.1.2"
