import numpy as np
from scipy.stats import lognorm
import csv

mus = np.array([-0.33, -1.42, -0.1, -1.06, 0.3, -0.89, 0.46, -0.8, -0.56])
sigmas = np.sqrt(np.array([0.64, 0.86, 0.6, 1.03, 0.73, 1.49, 0.25, 0.98, 0.75]))

x = np.linspace(0.01)
